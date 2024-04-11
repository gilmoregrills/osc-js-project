# osc-chat

multiplayer osc message processor and sender

## running locally

```bash
docker build -t osc-chat:latest .
docker run -rm -it -p 8080:8080 -p 8081:8081 -p 57121:57121/udp osc-chat:latest
```
then go to `http://localhost:8080` in your browser, or send OSC messages to `localhost:57121`

## deploying to aws

log in to the right aws account, then run:

```bash
yarn cdk deploy
```

## notes/gotchas

### orca-c osc message format

if you're using orca to send messages to osc-chat, orca-c requires that you set the length of the orca messages, so messages must look like:

```
=<path><length><arg1><arg2>...<arg34>
```
