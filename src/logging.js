var messageLog = [];

export const updateMessageLog = (oscMsg) => {
  messageLog.push(
    `${oscMsg.args[0]}: ${JSON.stringify(oscMsg.args[1])} -> ${oscMsg.address}`,
  );
  if (messageLog.length > 6) {
    messageLog.shift();
  }
  const result = messageLog.map((val) => `<p>${val}</p>`).join("");
  document.getElementById("log-messages").innerHTML = result;
};
