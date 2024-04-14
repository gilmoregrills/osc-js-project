const sendOsc = (channel, args) => {
  console.log(
    `sending osc from frontend to backend and back again on channel: ${channel} with args: ${args}`,
  );
  // todo: add validation that we're receiving only numbers
  oscPort.send({
    address: channel,
    args: args.split(" ").map(Number),
  });
  document.getElementById("sent_message").textContent =
    `sent: {address: ${channel}, args: ${args}}`;
};
