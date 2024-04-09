var oscPort = new osc.WebSocketPort({
  url: "ws://localhost:8081", // URL to your Web Socket server.
});
console.log("OSC Port created");

const handleControlCodes = (oscMsg) => {
  document.getElementById(`opt_${oscMsg.args[0]}`).textContent =
    `opt: ${oscMsg.args[1]}`;
};

const renderRawInput = (oscMsg) => {
  document.getElementById("input_receiver").textContent = `${JSON.stringify(
    oscMsg,
    null,
    2,
  )}_ routing args to channel_${oscMsg.address}`;
};

oscPort.on("message", function (oscMsg) {
  console.log("OSC message received:", oscMsg);
  renderRawInput(oscMsg);

  if (oscMsg.address === "/0") {
    handleControlCodes(oscMsg);
  }

  document.getElementById(`channel_${oscMsg.address}`).textContent =
    `last_message: ${JSON.stringify(oscMsg.args)}`;
});

oscPort.open();
console.log("OSC Port opened");
