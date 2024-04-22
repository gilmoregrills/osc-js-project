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
    console.log("Starting audio context.");
    await start();
    console.log("Audio context is ready.");
    oscPort.open();
    console.log("OSC WebSocketPort opened");
  });

document.getElementById("broadcast-form").onsubmit = (event) => {
  console.log(JSON.stringify(event));
  event.preventDefault();
  const channel = event.channel.value;
  const args = event.args.value;
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

console.log(JSON.stringify(allChannels));
allChannels.initialise();

// this is like our main function
oscPort.on("message", (oscMsg) => {
  updateMessageLog(oscMsg);
  allChannels.channels[oscMsg.address].handle(oscMsg);
});
