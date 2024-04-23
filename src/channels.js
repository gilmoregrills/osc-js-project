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
    this.volume = -8;
    this.lastMessageDescription = "awaiting input";
  }

  setVolume(vol) {
    this.volume = -vol;
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

  setVoice(arg) {
    const [voiceName, voice] = this.mapArgToVoice(arg);
    this.voiceName = voiceName;
    this.voice = voice;
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

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p>channel type: ${this.channelType}</p>
      <h3>opt_group(1): vol</h3>
      <p id="vol_${this.address}">volume: ${this.volume}dB</p>
      <h3>opt_group(2): voice</h3>
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

    const oscSynth = new this.voice({ volume: this.volume }).toDestination();
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

  setAmplitudeEnvelope(attack, decay, sustain, release) {
    this.amplitudeEnvelopeArgs = {
      attack: attack,
      decay: decay,
      sustain: sustain,
      release: release,
    };
  }

  setWaveformAndPartial(wave, partial) {
    this.waveform = this.mapArgsToWaveform(wave, partial);
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

  generateInnerHTML() {
    return `
      <h2>channel:${this.address}</h2>
      <p>channel type: ${this.channelType}</p>
      <h3>opt_group(1): vol</h3>
      <p id="vol_${this.address}">volume: ${this.volume}dB</p>
      <h3>opt_group(2): waveform</h3>
      <p id="waveform_${this.address}">waveform: ${this.waveform}</p>
      <h3>opt_group(3): envelope</h3>
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
      volume: this.volume,
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

  handle(oscMsg) {
    console.log(
      `This is channel: ${this.address} handling the message: ${JSON.stringify(oscMsg)}`,
    );

    const channel = allChannels.channels[`/${oscMsg.args[0]}`];
    var actionMessage = "";

    if (channel instanceof InstrumentChannel) {
      switch (oscMsg.args[1]) {
        case 1:
          channel.setVolume(oscMsg.args[2]);
          actionMessage = `volume: ${channel.volume}`;
          break;
        case 2:
          channel.setVoice(oscMsg.args[2]);
          actionMessage = `voice: ${channel.voiceName}`;
          break;
        default:
          console.log("Invalid option group");
      }
    } else if (channel instanceof SynthChannel) {
      switch (oscMsg.args[1]) {
        case 1:
          channel.setVolume(oscMsg.args[2]);
          actionMessage = `volume: ${channel.volume}`;
          break;
        case 2:
          channel.setWaveformAndPartial(oscMsg.args[2], oscMsg.args[3]);
          actionMessage = `waveform: ${channel.waveform}`;
          break;
        case 3:
          channel.setAmplitudeEnvelope(
            oscMsg.args[2],
            oscMsg.args[3],
            oscMsg.args[4],
            oscMsg.args[5],
          );
          actionMessage = `amplitude envelope: ${JSON.stringify(
            channel.amplitudeEnvelopeArgs,
          )}`;
          break;
        default:
          console.log("Invalid option group");
      }
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
