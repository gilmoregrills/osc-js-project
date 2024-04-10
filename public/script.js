var oscPort = new osc.WebSocketPort({
  url: `ws://${location.hostname}:8081`, // URL to your Web Socket server.
});
console.log("OSC Port created");

oscPort.open();
console.log("OSC Port opened");

const handleControlCodes = (oscMsg) => {
  document.getElementById(`opt_${oscMsg.args[0]}`).textContent =
    `opt: ${oscMsg.args[1]}`;
  document.getElementById("set_opt").textContent =
    `set:channel:/${oscMsg.args[0]}.opt to: ${oscMsg.args[1]}`;
};

const renderRawInput = (oscMsg) => {
  document.getElementById("input_receiver").textContent = `${JSON.stringify(
    oscMsg,
    null,
    2,
  )}_ routing args to channel_${oscMsg.address}`;
};

const sendOsc = () => {
  console.log(`attempting to send osc message to ${oscPort.options.url}`);
  oscPort.send({
    address: "/0",
    args: [2, 2, 5],
  });
};

oscPort.on("message", (oscMsg) => {
  console.log("OSC message received:", oscMsg);
  renderRawInput(oscMsg);

  if (oscMsg.address === "/0") {
    handleControlCodes(oscMsg);
  }

  document.getElementById(`channel_${oscMsg.address}`).textContent =
    `last_message: ${JSON.stringify(oscMsg.args)}`;
});
