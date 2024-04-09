const osc = require("osc"),
  express = require("express"),
  WebSocket = require("ws");

// Create an Express server app
// and serve up a directory of static files.
const app = express();
const port = 8080;
server = app.listen(port, () => {
  console.log(`Express listening on port ${port}`);
});
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

var getIPAddresses = function () {
  var os = require("os"),
    interfaces = os.networkInterfaces(),
    ipAddresses = [];

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

// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 8081,
});
console.log("UDP port created on 0.0.0.0:57121");

// Listen for incoming OSC messages.
udpPort.on("message", function (oscMsg, timeTag, info) {
  console.log("An OSC message just arrived via UDP!", oscMsg);
  console.log("Remote info is: ", info);
});

udpPort.on("ready", function () {
  var ipAddresses = getIPAddresses();
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

var wss = new WebSocket.Server({
  port: 8081,
});

wss.on("connection", function (socket) {
  console.log("A Web Socket connection has been established!");
  var socketPort = new osc.WebSocketPort({
    socket: socket,
  });

  var relay = new osc.Relay(udpPort, socketPort, {
    raw: true,
  });
});

// var oscPort = new osc.WebSocketPort({
//   url: "ws://localhost:8081", // URL to your Web Socket server.
//   socket: wss,
//   metadata: true,
// });
//
// oscPort.open();
