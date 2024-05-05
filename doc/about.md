# osc-chat

osc-chat is a real-time <a href="https://github.com/hundredrabbits/Orca">ORCA</a>-compatible multiplayer sound generator. Users can chat via external tools like ORCA, or using the simple sequencer built into the client.

## How it works

osc-chat receives simple OSC messages via the server, and broadcasts them to all connected clients, and the clients then generate sound based on what they receive.

This means that all clients should hear the same things, and can influence what other clients hear.
