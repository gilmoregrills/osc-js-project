# osc-chat

multiplayer osc message processor and sender

## todo

### general features

- [x] use webpack so i can structure my frontend code more nicely
- [x] model and load channels in a way that's more maintainable and makes adding channels easier
- [x] add some basic channel settings and ensure they're extensible
- [x] add per-channel volume control
- [x] start persisting channel config to a db (must be done entirely server-side) and loading from it on startup
- [ ] add effects to channels, or a way of adding/confguring effects
- [ ] display all logs at /logs
- [ ] quantize messages that trigger sound, or otherwise ensure that new messages snap to a grid
- [ ] assign new connections a randomly generated username and include that username in the logs
- [ ] OPTIONAL (if possible): persist that username between sessions somehow?
- [ ] add some visual feedback on channels when a sound is produced
- [ ] add some visual feedback on channels when settings are changed
- [ ] improve overall visual design

### channel types

- [x] control channel (used to modify other channels)
- [x] instrument channel with selectable voices
- [x] synth channel with configurable wave & envelope
- [ ] sampler channel with configurable samples for each note
- [ ] ???


## running locally

always:
```bash
yarn install
yarn build
```

### without docker

```bash
yarn run start
```

### with docker

```bash
yarn run build:docker
yarn run start:docker
```


then go to `http://localhost:8080` in your browser, or send OSC messages to `localhost:57121`

## deploying to aws

log in to the right aws account, then run:

```bash
yarn build
yarn cdk deploy
```
