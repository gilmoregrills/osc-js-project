import { Synth, Time } from "tone";
import { convertIntsToPitchOctave } from "./util";

class Channel {
  constructor(address, opt) {
    this.address = address;
    this.opt = opt;
    this.lastMessageDescription = "awaiting input";
  }

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p id="opt_${this.address}">opt: ${this.opt}</p>
      <p id="last_msg_desc_${this.address}">${this.lastMessageDescription}</p>
    `;
  }

  render() {
    const channelDiv = document.getElementById(`channel_${this.address}`);
    channelDiv.innerHTML = this.generateInnerHTML();
  }

  initialise() {
    console.log("rendering channel");
    const div = document.createElement("div");
    div.id = `channel_${this.address}`;
    div.class = "channel";
    div.innerHTML = this.generateInnerHTML();
    document.getElementById("channel-container").appendChild(div);
  }

  updateLastMessageDescription(oscMsg, note, duration) {
    this.lastMessageDescription = `received: [${oscMsg.args}] played: ${note} for: ${duration}`;
  }

  handle(oscMsg) {
    console.log(
      `This is channel: ${this.address} handling the message: ${JSON.stringify(oscMsg)}`,
    );
    const note = convertIntsToPitchOctave(oscMsg.args[0], oscMsg.args[1]);
    const duration = Time(oscMsg.args[2] / 10).toNotation();

    const oscSynth = new Synth().toDestination();
    oscSynth.triggerAttackRelease(note, duration);

    this.updateLastMessageDescription(oscMsg, note, duration);
    this.render();
  }
}

class ControlChannel extends Channel {
  constructor(address, opt) {
    super(address, opt);
  }

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p id="last_msg_desc_${this.address}">${this.lastMessageDescription}</p>
    `;
  }

  updateLastMessageDescription(oscMsg) {
    this.lastMessageDescription = `set:channel:/${oscMsg.args[0]}.opt to: ${oscMsg.args[1]}`;
  }

  handle(oscMsg) {
    console.log(
      `This is channel: ${this.address} handling the message: ${JSON.stringify(oscMsg)}`,
    );
    const channel = allChannels.channels[`/${oscMsg.args[0]}`];
    channel.opt = oscMsg.args[1];
    channel.render();
    this.updateLastMessageDescription(oscMsg);
    this.render();
  }
}

export const allChannels = {
  channels: {
    "/0": new ControlChannel("/0", "1"),
    "/1": new Channel("/1", "1"),
  },

  initialise() {
    for (const addr in this.channels) {
      console.log(JSON.stringify(addr));
      console.log(JSON.stringify(this.channels[addr]));
      this.channels[addr].initialise();
    }
  },
};
