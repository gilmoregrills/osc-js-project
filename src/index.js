import { WebSocketPort } from "osc/dist/osc-browser";
import { start } from "tone";
import { messageLog, updateMessageLog } from "./logging";
import { Channel, ControlChannel, allChannels } from "./channels";

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

allChannels.initialise();

oscPort.on("message", (oscMsg) => {
  updateMessageLog(oscMsg);
  allChannels.channels[oscMsg.address].handle(oscMsg);
});
