const wsUrl =
  location.host == "localhost:8080"
    ? "ws://localhost:8081"
    : `wss://${location.host}/ws`;

var oscPort = new osc.WebSocketPort({
  url: wsUrl,
});
console.log(`OSC WebSocketPort created on ${wsUrl}`);

document.getElementById("start")?.addEventListener("click", async () => {
  console.log("Starting audio context.");
  await Tone.start();
  console.log("Audio context is ready.");
  oscPort.open();
  console.log("OSC WebSocketPort opened");
});

const updateLastMessageForChannel = (oscMsg) => {
  document.getElementById(`channel_${oscMsg.address}`).textContent =
    `last_message: ${JSON.stringify(oscMsg.args)}`;
};

var messageLog = [];
const updateMessageLog = (oscMsg) => {
  messageLog.push(JSON.stringify(oscMsg));
  if (messageLog.length > 6) {
    messageLog.shift();
  }
  const result = messageLog.map((val) => `<p>${val}</p>`).join("");
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

const convertIntsToPitchOctave = (pitch, octave) => {
  const pitchMap = {
    1: "C",
    2: "C#",
    3: "D",
    4: "D#",
    5: "E",
    6: "F",
    7: "F#",
    8: "G",
    9: "G#",
    10: "A",
    11: "A#",
    12: "B",
  };
  return `${pitchMap[pitch]}${octave}`;
};

const handleSynthChannel = (oscMsg) => {
  console.log(`receiving message for synth channel: ${oscMsg.address}`);
  const note = convertIntsToPitchOctave(oscMsg.args[1], oscMsg.args[2]);
  const time = Tone.Time(oscMsg.args[3] / 10).toNotation();

  // if message is for channel 1, trigger a synth
  if (oscMsg.address === "/1") {
    // todo: use oscMsg.args[0] to set the synth voice
    console.log(`triggering note: ${note} at time: ${time}`);

    const basicSynth = new Tone.Synth().toDestination();
    const now = Tone.now();
    basicSynth.triggerAttackRelease(note, time, now);
  }
};

// this is like our main function
oscPort.on("message", (oscMsg) => {
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
