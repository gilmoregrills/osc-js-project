const wsUrl =
  location.host == "localhost:8080"
    ? "ws://localhost:8081"
    : `wss://${location.host}/ws`;

var oscPort = new osc.WebSocketPort({
  url: wsUrl,
});
console.log(`OSC WebSocketPort created on ${wsUrl}`);

oscPort.open();
console.log("OSC WebSocketPort opened");

const renderRawInput = (oscMsg) => {
  document.getElementById("input_receiver").textContent = `${JSON.stringify(
    oscMsg,
    null,
    2,
  )}_ routing args to channel_${oscMsg.address}`;
};

// this is like our main function
oscPort.on("message", (oscMsg) => {
  console.log("OSC message received:", oscMsg);
  renderRawInput(oscMsg);

  if (oscMsg.address === "/0") {
    handleControlCodes(oscMsg);
  }

  document.getElementById(`channel_${oscMsg.address}`).textContent =
    `last_message: ${JSON.stringify(oscMsg.args)}`;
});
