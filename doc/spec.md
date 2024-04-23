# osc msg spec

This page is about the OSC message spec that osc-chat expects, for the API spec see [api](../api).

osc-chat is built with [ORCA](https://github.com/hundredrabbits/Orca) in mind. Because of this, it expects all messages made entirely of integers between 0 and 35.

```
{
  'address': int,
  'args': [int, int]
}
```

The address field is always an integer that corresponds to the channel number.

The args field is always an array of ints, which are interpreted in different ways depending on the channel. This spec describes the function of each argument by array index, starting with 0 as per.

## channel 0

Channel 0 is always a control channel that accepts messages that modify settings on other channels.

Channel 0 is controlled by sending messages to the address 0. Channel settings modified using channel 0 will apply to all messages sent to the modified channel until the settings are changed again.

| arg index | description                                                              |
|-----------|--------------------------------------------------------------------------|
| 0         | selects the channel you want to modify attributes for                    |
| 1         | selects the option group you want to modify                              |
| 2 ... 35  | changes settings depending on the option group type                      |

### example

This updates a voice option group (labeled as option group 1) on channel 1 (an instrument channel) to `2`, which maps to the "membrane synth" option as documented below.
```json
{
  'address': 0,
  'args': [1, 1, 2]
}
```

### option groups

Option groups' settings are set depending on the values of arguments of index 2 and up. As such, the tables in this section will all go from arg index 2.

Each channel will display its current settings, grouped by option groups. So for example if channel 1 is an instrument channel, it might have a voice selection option group, to change the voice of the instrument check the section about that option group below.

#### volume

Sets the volume of the channel, in decibels. The level is set -`<arg value>`, so the highest volume can be is 0.

| arg index | sets     | arg value | value    |
|-----------|----------|-----------|----------|
| 2         | volume   | 0 - 35    | sine     |

##### example

`[y, x, 10]` to channel 0 will update the volume option group at `x` for channel `y` setting the volume to -10dB.


#### voice

| arg index | arg value | instrument      |
|-----------|-----------|---------------- |
| 2         | 1         | basic synth     |
|           | 2         | membrane synth  |

##### example

`[y, x, 2]` to channel 0 will update the voice option group at `x` for channel `y` setting the voice to "membrane synth".

#### waveform

The waveform option group is used to change the waveform of the oscillator, setting it to "<waveform><partial>".

| arg index | sets     | arg value | value    |
|-----------|----------|-----------|----------|
| 2         | waveform | 1         | sine     |
|           |          | 2         | square   |
|           |          | 3         | sawtooth |
|           |          | 4         | triangle |
| 3         | partial  | 1 - 32    | 1 - 32   |

##### example

`[y, x, 1, 8]` to channel 0 will update the waveform option group at `x` for channel `y` setting the waveform to "sine8".

#### envelope

Sets the attack, decay, sustain, and release of the envelope attached to this option group.

Each option is set to the value passed to that argument, divided by 10.

| arg index | sets     | arg value | value            |
|-----------|----------|-----------|------------------|
| 2         | attack   | 1 - 35    | <arg value> / 10 |
| 3         | decay    | 1 - 35    | <arg value> / 10 |
| 4         | sustain  | 1 - 35    | <arg value> / 10 |
| 5         | release  | 1 - 35    | <arg value> / 10 |

##### example

`[y, x, 1, 5, 20, 30, 40]` would update the envelope option group at `x` for channel `y`, setting the envelope to attack 0.5s, decay 2s, sustain 3s, and release 4s.

## channels 1+

Channels 1 and up are controlled by sending messages to the address that corresponds with the channel number.

### synth/instrument channels

Instrument channels are initialised with a voice, visible in the column for that channel, which can be changed by sending a message to channel 0 as described above.

For each of these channels, the args are interpreted as follows:

| arg index | description                                                                            |
|-----------|----------------------------------------------------------------------------------------|
| 0         | note, between 1 and 12, running from `C` to `B`, for more info see "pitch map" below   |
| 1         | octave, from 0 and up, where 0 is the lowest octave                                    |
| 2         | duration, in seconds `/ 10`, so 10 is 1 second, etc - subject to change                |

### example

This sends a message with the args `[1, 2, 3]` to channel 1.
```json
{
  'address': 1,
  'args': [1, 2, 3]
}
```

### pitch map

Why does this start from 1 and not 0? Because it seemed more intuitive for humans idk.

```javascript
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
```
