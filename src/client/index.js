import { start, getDestination, Transport } from "tone";
import { updateInputMessageLog } from "./logging";
import { Channel, ControlChannel, allChannels } from "./channels";
import { makeSequencer } from "./sequencer";
import { WebSocketPort, timeTag } from "osc";
import { messageStringToMessage } from "./utils";
import { startWaveformLoop } from "./waveform";

//setup websocket and OSC
const wsUrl =
  location.host == "localhost:8080"
    ? "ws://localhost:8081"
    : `wss://${location.host}/ws`;

var oscPort = new WebSocketPort({
  url: wsUrl,
});
console.log(`OSC WebSocketPort created on ${wsUrl}`);

oscPort.on("message", (oscMsg) => {
  allChannels.channels[oscMsg.address].handle(oscMsg);
  updateInputMessageLog(
    `${oscMsg.args[0]}: ${JSON.stringify(oscMsg.args[1])} -> ${oscMsg.address}`,
  );
});

//setup channels
allChannels.initialise();

//setup sequencer
const grid = makeSequencer();
var beat = 0;

const startSequencerLoop = () => {
  const repeat = (time) => {
    const messages = [];
    grid.forEach((row, index) => {
      let item = row[beat];
      let prevBeat = beat === 0 ? 7 : beat - 1;
      document.getElementById(`${index}${prevBeat}`).style.textDecoration =
        "none";
      document.getElementById(`${index}${beat}`).style.textDecoration =
        "underline";
      if (item.isActive) {
        const message = messageStringToMessage(
          document.getElementById(`sequencer-message-field-${index}`).value,
        );
        messages.push(message);
      }
    });
    if (messages.length > 0) {
      oscPort.send({ packets: messages, timeTag: timeTag(time) });
    }
    beat = (beat + 1) % 8;
  };

  Transport.scheduleRepeat(repeat, "8n");
};

// setup event listeners/initialisers
window.onload = () => {
  document
    .getElementById("engine-start-button")
    ?.addEventListener("click", async () => {
      await start();
      console.log("Audio context is ready");
      oscPort.open();
      console.log("OSC WebSocketPort opened");
      getDestination().volume.rampTo(-10, 0.001);
      startSequencerLoop();
      startWaveformLoop();
      Transport.start();
    });

  document
    .getElementById("broadcast-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const message = messageStringToMessage(
        document.getElementById("text-input-message-field").value,
      );
      console.log(
        `Sending osc from frontend to backend and back again: ${JSON.stringify(message)}`,
      );
      oscPort.send(message);
      document.getElementById("sent-message").textContent =
        `sent: ${JSON.stringify(message)}`;
    });
};
