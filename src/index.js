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
  console.log(`Express listening on port ${port}`);
});
app.use(express.static("src/public"));
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

const getIPAddresses = () => {
  const interfaces = os.networkInterfaces();
  var ipAddresses = [];

  for (var deviceName in interfaces) {
    var addresses = interfaces[deviceName];

    for (var i = 0; i < addresses.length; i++) {
      var addressInfo = addresses[i];

      if (addressInfo.family === "IPv4" && !addressInfo.internal) {
        ipAddresses.push(addressInfo.address);
      }
    }
  }

  return ipAddresses;
};

// create UDPPort
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 8081,
  broadcast: true,
});
console.log("UDP port created on 0.0.0.0:57121");

udpPort.on("message", (oscMsg, timeTag, info) => {
  console.log("An OSC message just arrived via UDP!", oscMsg);
  console.log("Remote info is: ", info);
});

udpPort.on("ready", () => {
  const ipAddresses = getIPAddresses();
  console.log("Listening for OSC over UDP.");
  ipAddresses.forEach(function (address) {
    console.log(" Host:", address + ", Port:", udpPort.options.localPort);
  });
  console.log(
    "Broadcasting OSC over UDP to",
    udpPort.options.remoteAddress + ", Port:",
    udpPort.options.remotePort,
  );
});

// Open the socket.
udpPort.open();

const wss = new WebSocket.Server({
  port: 8081,
});

wss.on("connection", (socket) => {
  console.log("A Web Socket connection has been established!");
  var socketPort = new osc.WebSocketPort({
    socket: socket,
  });

  var relay = new osc.Relay(udpPort, socketPort, {
    raw: true,
  });

  socketPort.on("message", (oscMsg) => {
    console.log("An OSC message just arrived via WebSocket!", oscMsg);
    udpPort.send(oscMsg, "0.0.0.0", "57121");
  });
});
