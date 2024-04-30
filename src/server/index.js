const osc = require("osc");
const express = require("express");
const WebSocket = require("ws");
const marked = require("marked");
const readFileSync = require("fs").readFileSync;
const { uniqueNamesGenerator, names } = require("unique-names-generator");
const ipInt = require("ip-to-int");
const generateNameForIp = require("./utils").generateNameForIp;
const getAWSCredentialsDependingOnEnvironment =
  require("./utils").getAWSCredentialsDependingOnEnvironment;
const saveControlMessage = require("./ddb").saveControlMessage;
const getControlMessages = require("./ddb").getControlMessages;

// express

const app = express();
const port = 8080;
server = app.listen(port, () => {
  console.log(`Express listening on port ${port}.`);
});
app.use(express.static("dist"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "../dist/index.html");
});

app.get("/spec", (req, res) => {
  var path = __dirname + "../doc/spec.md";
  var file = readFileSync(path, "utf8");
  res.send(marked.parse(file.toString()));
});

app.get("/api", (req, res) => {
  var path = __dirname + "../doc/api.md";
  var file = readFileSync(path, "utf8");
  res.send(marked.parse(file.toString()));
});

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

app.get("/api/get-control-messages", async (req, res) => {
  const messages = await getControlMessages();
  console.log(`Retrieved control messages: ${JSON.stringify(messages)}`);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ controlMessages: messages }));
});

// OSC UDP Port

const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 8081,
  broadcast: true,
});

console.log("UDP port created on 0.0.0.0:57121");

udpPort.on("message", (oscMsg, timeTag, info) => {
  if (oscMsg.address === "/0") {
    saveControlMessage(oscMsg);
  }
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

  function forwardMessageToWebSocket(oscMsg, timeTag, info) {
    console.log(
      `Received OSC message via UDP: ${JSON.stringify(oscMsg)}, redirecting it to WebSocket.`,
    );
    try {
      socketPort.send({
        address: oscMsg.address,
        args: [
          {
            type: "s",
            value: generateNameForIp(info.address),
          },
          oscMsg.args,
        ],
      });
    } catch (error) {
      if (error.code === "ERR_UNHANDLED_ERROR") {
        console.log(
          `Error sending OSC message to WebSocket: ${error.message}, closing the connection and removing the listener.`,
        );
        udpPort.removeListener("message", forwardMessageToWebSocket);
        socketPort.close();
      } else {
        throw error;
      }
    }
  }

  udpPort.on("message", forwardMessageToWebSocket);

  socketPort.on("message", (oscMsg) => {
    console.log(
      `Received OSC message via WebSocket: ${JSON.stringify(oscMsg)}, redirecting it to UDP port.`,
    );
    udpPort.send(oscMsg, "0.0.0.0", "57121");
  });
});
