const osc = require("osc");
const express = require("express");
const WebSocket = require("ws");
const os = require("os");
const marked = require("marked");
const readFileSync = require("fs").readFileSync;

// express
const app = express();
const port = 8080;
server = app.listen(port, () => {
  console.log(`Express listening on port ${port}.`);
});
app.use(express.static("src/public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
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
