const osc = require("osc");
const express = require("express");
const WebSocket = require("ws");
const os = require("os");
const marked = require("marked");
const readFileSync = require("fs").readFileSync;
const {
  DescribeTableCommand,
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const {
  ScanCommand,
  PutCommand,
  DynamoDBDocumentClient,
} = require("@aws-sdk/lib-dynamodb");
const { fromSSO } = require("@aws-sdk/credential-provider-sso");
const { fromInstanceMetadata } = require("@aws-sdk/credential-providers");

// express
const app = express();
const port = 8080;
server = app.listen(port, () => {
  console.log(`Express listening on port ${port}.`);
});
app.use(express.static("dist"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

app.get("/spec", (req, res) => {
  var path = __dirname + "/doc/spec.md";
  var file = readFileSync(path, "utf8");
  res.send(marked.parse(file.toString()));
});

app.get("/api", (req, res) => {
  var path = __dirname + "/doc/api.md";
  var file = readFileSync(path, "utf8");
  res.send(marked.parse(file.toString()));
});

// todo: fix printing the OSC message in my log lines
app.post("/api/send-message", (req, res) => {
  console.log(
    `Received OSC message via API: ${req.body}, redirecting it to UDP port`,
  );
  udpPort.send(
    {
      address: req.body.address,
      args: req.body.args,
    },
    "0.0.0.0",
    "57121",
  );

  res.send(
    `OSC message sent to channel ${req.body.address} with args ${req.body.args.toString()}`,
  );
});

var credentials;
if (process.env.NODE_ENV == "production") {
  credentials = fromInstanceMetadata()();
} else {
  credentials = fromSSO({ profile: "osc-chat" })();
}

const ddbClient = new DynamoDBClient({
  region: "eu-west-2",
  credentials: credentials,
});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = (async () => {
  const ssmClient = new SSMClient({
    region: "eu-west-2",
    credentials: credentials,
  });
  const command = new GetParameterCommand({
    Name: "/osc-chat/dynamodb-table-name",
  });
  const response = await ssmClient.send(command);
  console.log(`Retrieved DynamoDB table name: ${response.Parameter.Value}`);
  return response.Parameter.Value;
})();

const saveControlMessage = async (oscMsg) => {
  console.log(
    `Saving control message ${JSON.stringify(oscMsg)} to DynamoDB table: ${await tableName}`,
  );

  const command = new PutCommand({
    TableName: await tableName,
    Item: {
      channelAndGroup: `${oscMsg.args[0]}${oscMsg.args[1]}`,
      channel: oscMsg.address,
      args: oscMsg.args,
      timestamp: Date.now().toString(),
    },
  });

  const response = await docClient.send(command);
  return response;
};

app.get("/api/get-control-messages", async (req, res) => {
  console.log(
    `Fetching all control messages from DynamoDB table: ${await tableName}`,
  );

  const command = new ScanCommand({
    TableName: await tableName,
  });

  const response = await docClient.send(command);
  const messages = response.Items.map((item) => ({
    address: item.channel,
    args: item.args,
  }));
  console.log(`Retrieved control messages: ${JSON.stringify(messages)}`);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ controlMessages: messages }));
});

const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 8081,
  broadcast: true,
});
console.log("UDP port created on 0.0.0.0:57121");

udpPort.on("message", (oscMsg, timeTag, info) => {
  console.log(
    `Received OSC message via UDP: ${oscMsg}, relaying to WebSocket.`,
  );
  console.log("Remote info is: .", info);
  saveControlMessage(oscMsg);
});

udpPort.on("ready", () => {
  console.log(
    "Broadcasting OSC over UDP to",
    udpPort.options.remoteAddress + ", Port:",
    udpPort.options.remotePort,
  );
});

udpPort.open();

// WebSocket Server
const wss = new WebSocket.Server({
  port: 8081,
});

wss.on("connection", (socket) => {
  console.log("A WebSocket connection has been established.");
  var socketPort = new osc.WebSocketPort({
    socket: socket,
  });

  var relay = new osc.Relay(udpPort, socketPort, {
    raw: true,
  });

  socketPort.on("message", (oscMsg) => {
    console.log(
      `Received OSC message via WebSocket: ${oscMsg}, redirecting it to UDP port.`,
    );
    udpPort.send(oscMsg, "0.0.0.0", "57121");
  });
});
