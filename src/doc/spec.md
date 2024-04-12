# osc msg spec

Osc-chat is built with [ORCA](https://github.com/hundredrabbits/Orca) in mind. Because of this, it expects all messages made entirely of integers between 0 and 35.

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

Currently channels 1 and up don't do anything other than display the message.

| arg index | description                                           |
|-----------|-------------|
| 0...?     | no function |

### example

This sends a message with the args `[1, 2, 3]` to channel 1.
```json
{
  'address': 1,
  'args': [1, 2, 3]
}
```
