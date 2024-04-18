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

Channel 0 accepts messages that modify settings on other channels.

Channel 0 is controlled by sending messages to the address 0.

| arg index | description                                           |
|-----------|-------------------------------------------------------|
| 0         | selects the channel you want to modify attributes for |
| 1         | sets the `opt` parameter's value                      |

### example

This sets the opt parameter of channel 1 to 5.
```json
{
  'address': 0,
  'args': [1, 5]
}
```

## channels 1+

Channels 1 and up are controlled by sending messages to the address that corresponds with the channel number.

Currently channels 1+ play tones from different instruments:

| channel | instrument      |
|---------|---------------- |
| 1       | basic synth     |
| 2       | membrane synth  |

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
