var messageLog = [];

export const updateMessageLog = (oscMsg) => {
  messageLog.push(JSON.stringify(oscMsg));
  if (messageLog.length > 6) {
    messageLog.shift();
  }
  const result = messageLog.map((val) => `<p>${val}</p>`).join("");
  document.getElementById("log-messages").innerHTML = result;
};
