var oscPort = new osc.WebSocketPort({
  url: "ws://localhost:8081", // URL to your Web Socket server.
});
console.log("OSC Port created");

oscPort.on("message", function (oscMsg) {
  console.log("OSC message received:", oscMsg);
});

oscPort.open();
console.log("OSC Port opened");
