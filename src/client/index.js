import { WebSocketPort, timeTag } from "osc/dist/osc-browser";
import { start, getDestination, Transport } from "tone";
import { messageLog, updateMessageLog } from "./logging";
import { Channel, ControlChannel, allChannels } from "./channels";
import { makeSequencer } from "./sequencer";

const wsUrl =
  location.host == "localhost:8080"
    ? "ws://localhost:8081"
    : `wss://${location.host}/ws`;

var oscPort = new WebSocketPort({
  url: wsUrl,
});
console.log(`OSC WebSocketPort created on ${wsUrl}`);

document
  .getElementById("engine-start-button")
  ?.addEventListener("click", async () => {
    await start();
    console.log("Audio context is ready");
    oscPort.open();
    console.log("OSC WebSocketPort opened");
    getDestination().volume.rampTo(-10, 0.001);
    configLoop();
    Transport.start();
  });

document
  .getElementById("broadcast-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const channel = `/${document.getElementById("channel").value}`;
    const args = document.getElementById("args").value;
    console.log(
      `Sending osc from frontend to backend and back again on channel: ${channel} with args: ${args}`,
    );
    // todo: add validation that we're receiving only numbers
    oscPort.send({
      address: channel,
      args: args.split(" ").map(Number),
    });
    document.getElementById("sent_message").textContent =
      `sent: {address: ${channel}, args: ${args}}`;
  });

oscPort.on("message", (oscMsg) => {
  allChannels.channels[oscMsg.address].handle(oscMsg);
  updateMessageLog(oscMsg);
});

allChannels.initialise();
const grid = makeSequencer();
var beat = 0;

const configLoop = () => {
  const repeat = (time) => {
    const messages = [];
    grid.forEach((row, index) => {
      let item = row[beat];
      if (item.isActive) {
        console.log(beat);
        let rawMsg = document
          .getElementById(`sequencer-message-field-${index}`)
          .value.split(" ");
        messages.push({
          address: `/${rawMsg[0]}`,
          args: rawMsg.slice(1).map(Number),
        });
      }
    });
    if (messages.length > 0) {
      oscPort.send({ packets: messages, timeTag: timeTag(time) });
    }
    beat = (beat + 1) % 8;
  };

  Transport.bpm.value = 60;
  Transport.scheduleRepeat(repeat, "8n");
};
