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

var messageLog = [];

const updateRawInput = (oscMsg) => {
  document.getElementById("input_receiver").textContent = `${JSON.stringify(
    oscMsg,
    null,
    2,
  )}_ routing args to channel_${oscMsg.address}`;
};

const updateLastMessageForChannel = (oscMsg) => {
  document.getElementById(`channel_${oscMsg.address}`).textContent =
    `last_message: ${JSON.stringify(oscMsg.args)}`;
};

const updateMessageLog = (oscMsg) => {
  messageLog.push(JSON.stringify(oscMsg));
  if (messageLog.length > 6) {
    messageLog.shift();
  }
  const result = messageLog.map((val) => `<p>${val}</p>`).join("");
  console.log(result);
  document.getElementById("log-messages").innerHTML = result;
};

const sendOsc = (channel, args) => {
  console.log(
    `sending osc from frontend to backend and back again on channel: ${channel} with args: ${args}`,
  );
  // todo: add validation that we're receiving only numbers
  oscPort.send({
    address: channel,
    args: args.split(" ").map(Number),
  });
  document.getElementById("sent_message").textContent =
    `sent: {address: ${channel}, args: ${args}}`;
};

const handleControlChannel = (oscMsg) => {
  document.getElementById(`opt_${oscMsg.args[0]}`).textContent =
    `opt: ${oscMsg.args[1]}`;
  document.getElementById("set_opt").textContent =
    `set:channel:/${oscMsg.args[0]}.opt to: ${oscMsg.args[1]}`;
};

const handleSynthChannel = (oscMsg) => {
  console.log(`receiving message for synth channel: ${oscMsg.address}`);
};

// this is like our main function
oscPort.on("message", (oscMsg) => {
  console.log("OSC message received:", oscMsg);
  updateRawInput(oscMsg);

  console.log(`channel: ${oscMsg.address}`);
  if (oscMsg.address === "/0") {
    console.log("Routing message to control channel");
    handleControlChannel(oscMsg);
  } else {
    console.log("Routing message to synth channel");
    handleSynthChannel(oscMsg);
  }

  updateLastMessageForChannel(oscMsg);
  updateMessageLog(oscMsg);
});
