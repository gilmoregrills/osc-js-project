import { WebSocketPort } from "osc";
import { Synth, MembraneSynth, Time, now, start } from "tone";

const wsUrl =
  location.host == "localhost:8080"
    ? "ws://localhost:8081"
    : `wss://${location.host}/ws`;

var oscPort = new WebSocketPort({
  url: wsUrl,
});
console.log(`OSC WebSocketPort created on ${wsUrl}`);

document.getElementById("start")?.addEventListener("click", async () => {
  console.log("Starting audio context.");
  await start();
  console.log("Audio context is ready.");
  oscPort.open();
  console.log("OSC WebSocketPort opened");
});

const updateLastMessageForChannel = (channel, message) => {
  document.getElementById(`channel_${channel}`).textContent = message;
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
  return `set:channel:/${oscMsg.args[0]}.opt to: ${oscMsg.args[1]}`;
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
  const note = convertIntsToPitchOctave(oscMsg.args[0], oscMsg.args[1]);
  const duration = Time(oscMsg.args[2] / 10).toNotation();

  if (oscMsg.address === "/1") {
    const oscSynth = new Synth().toDestination();
    const now = now();
    oscSynth.triggerAttackRelease(note, duration, now);
  } else if (oscMsg.address === "/2") {
    const membraneSynth = new MembraneSynth().toDestination();
    const now = now();
    membraneSynth.triggerAttackRelease(note, duration, now);
  } else if (oscMsg.address === "/3") {
    return "channel not yet implemented";
  }

  return `received: [${oscMsg.args}] played: ${note} for: ${duration}`;
};

// this is like our main function
oscPort.on("message", (oscMsg) => {
  console.log(`channel: ${oscMsg.address}, args: ${oscMsg.args}`);
  var logMsg;
  if (oscMsg.address === "/0") {
    logMsg = handleControlChannel(oscMsg);
  } else {
    logMsg = handleSynthChannel(oscMsg);
  }

  updateLastMessageForChannel(oscMsg.address, logMsg);
  updateMessageLog(oscMsg);
});
