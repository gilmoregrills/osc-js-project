import {
  MembraneSynth,
  Synth,
  Oscillator,
  AmplitudeEnvelope,
  Time,
} from "tone";
import { convertIntsToPitchOctave } from "./util";

class Channel {
  constructor(address) {
    this.address = address;
    this.channelType = "generic";
    this.lastMessageDescription = "awaiting input";
  }

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p>channel type: ${this.channelType}</p>
      <p id="last_msg_desc_${this.address}">${this.lastMessageDescription}</p>
    `;
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

  updateLastMessageDescription(oscMsg) {
    this.lastMessageDescription = `received: [${oscMsg}]`;
  }

  handle(oscMsg) {
    console.log(
      `This is channel: ${this.address} handling the message: ${JSON.stringify(oscMsg)}`,
    );
    this.updateLastMessageDescription(oscMsg, note, duration);
    this.render();
  }
}

class InstrumentChannel extends Channel {
  constructor(address, voice, voiceName) {
    super(address);
    this.voice = voice;
    this.voiceName = voiceName;
    this.channelType = "instrument";
    this.lastMessageDescription = "awaiting input";
  }

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p>channel type: ${this.channelType}</p>
      <p id="voice_${this.address}">voice: ${this.voiceName}</p>
      <p id="last_msg_desc_${this.address}">${this.lastMessageDescription}</p>
    `;
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

class SynthChannel extends Channel {
  constructor(address, waveform) {
    super(address);
    this.waveform = waveform;
    this.channelType = "synth";
    (this.amplitudeEnvelopeArgs = {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 1,
    }),
      (this.lastMessageDescription = "awaiting input");
  }

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p>channel type: ${this.channelType}</p>
      <p id="waveform_${this.address}">waveform: ${this.waveform}</p>
      <p id="amplitude_envelope_${this.address}">amplitude envelope: ${JSON.stringify(this.amplitudeEnvelopeArgs)}</p>
      <p id="last_msg_desc_${this.address}">${this.lastMessageDescription}</p>
    `;
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

    const env = new AmplitudeEnvelope(
      this.amplitudeEnvelopeArgs,
    ).toDestination();

    const osc = new Oscillator({
      frequency: note,
      type: this.waveform,
    })
      .connect(env)
      .start();

    env.triggerAttackRelease(duration);

    this.updateLastMessageDescription(oscMsg, note, duration);
    this.render();
  }
}

class ControlChannel extends Channel {
  constructor(address) {
    super(address, Synth);
    this.channelType = "control";
  }

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p>channel type: ${this.channelType}</p>
      <p id="last_msg_desc_${this.address}">${this.lastMessageDescription}</p>
    `;
  }

  updateLastMessageDescription(channel, action) {
    this.lastMessageDescription = `set:channel:/${channel} to: ${action}`;
  }

  mapArgToVoice(arg) {
    switch (arg) {
      case 1:
        return ["osc synth", Synth];
        break;
      case 2:
        return ["membrane synth", MembraneSynth];
        break;
      default:
        return ["osc synth", Synth];
    }
  }

  mapArgsToWaveform(wave, partial) {
    partial = partial === 0 ? "" : `${partial}`;
    switch (wave) {
      case 1:
        return `sine${partial}`;
        break;
      case 2:
        return `square${partial}`;
        break;
      case 3:
        return `sawtooth${partial}`;
        break;
      case 4:
        return `triangle${partial}`;
        break;
      default:
        return `sine${partial}`;
    }
  }

  handle(oscMsg) {
    console.log(
      `This is channel: ${this.address} handling the message: ${JSON.stringify(oscMsg)}`,
    );

    const channel = allChannels.channels[`/${oscMsg.args[0]}`];
    var actionMessage = "";

    if (channel instanceof InstrumentChannel) {
      [channel.voiceName, channel.voice] = this.mapArgToVoice(oscMsg.args[1]);
      actionMessage = `voice: ${channel.voiceName}`;
    } else if (channel instanceof SynthChannel) {
      channel.waveform = this.mapArgsToWaveform(oscMsg.args[1], oscMsg.args[2]);
      channel.amplitudeEnvelopeArgs = {
        attack: oscMsg.args[3] / 10,
        decay: oscMsg.args[4] / 10,
        sustain: oscMsg.args[5] / 10,
        release: oscMsg.args[6] / 10,
      };
      actionMessage = `waveform: ${channel.waveform} amplitude envelope: ${JSON.stringify(
        channel.amplitudeEnvelopeArgs,
      )}`;
    }

    channel.render();
    this.updateLastMessageDescription(channel.address, actionMessage);
    this.render();
  }
}

export const allChannels = {
  channels: {
    "/0": new ControlChannel("/0"),
    "/1": new InstrumentChannel("/1", Synth, "osc synth"),
    "/2": new InstrumentChannel("/2", MembraneSynth, "membrane synth"),
    "/3": new SynthChannel("/3", "sine"),
  },

  initialise() {
    for (const addr in this.channels) {
      this.channels[addr].initialise();
    }
  },
};
