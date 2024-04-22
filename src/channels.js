import { MembraneSynth, Synth, Time } from "tone";
import { convertIntsToPitchOctave } from "./util";

class Channel {
  constructor(address, voice) {
    this.address = address;
    this.voice = voice;
    this.lastMessageDescription = "awaiting input";
  }

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p id="voice_${this.address}">voice: ${this.voiceName()}</p>
      <p id="last_msg_desc_${this.address}">${this.lastMessageDescription}</p>
    `;
  }

  voiceName() {
    return this.voice.name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  }

  render() {
    const channelDiv = document.getElementById(`channel_${this.address}`);
    channelDiv.innerHTML = this.generateInnerHTML();
  }

  initialise() {
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

    const oscSynth = new this.voice().toDestination();
    oscSynth.triggerAttackRelease(note, duration);

    this.updateLastMessageDescription(oscMsg, note, duration);
    this.render();
  }
}

class ControlChannel extends Channel {
  constructor(address) {
    super(address, Synth);
  }

  mapArgToVoice(arg) {
    switch (arg) {
      case 1:
        return Synth;
        break;
      case 2:
        return MembraneSynth;
        break;
      default:
        return Synth;
    }
  }

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p id="last_msg_desc_${this.address}">${this.lastMessageDescription}</p>
    `;
  }

  updateLastMessageDescription(channel, voiceName) {
    this.lastMessageDescription = `set:channel:/${channel}.voice to: ${voiceName}`;
  }

  handle(oscMsg) {
    console.log(
      `This is channel: ${this.address} handling the message: ${JSON.stringify(oscMsg)}`,
    );
    const channel = allChannels.channels[`/${oscMsg.args[0]}`];
    channel.voice = this.mapArgToVoice(oscMsg.args[1]);
    channel.render();
    this.updateLastMessageDescription(channel.address, channel.voice.name);
    this.render();
  }
}

export const allChannels = {
  channels: {
    "/0": new ControlChannel("/0"),
    "/1": new Channel("/1", Synth),
    "/2": new Channel("/2", MembraneSynth),
  },

  initialise() {
    for (const addr in this.channels) {
      this.channels[addr].initialise();
    }
  },
};
