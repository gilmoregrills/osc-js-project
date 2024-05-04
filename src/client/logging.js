const updateMessageLog = (logMsg, log, divName) => {
  log.push(logMsg);
  if (log.length > 6) {
    log.shift();
  }
  const result = log.map((val) => `<p>${val}</p>`).join("");
  document.getElementById(divName).innerHTML = result;
};

var inputMessageLog = [];

export const updateInputMessageLog = (logMsg) => {
  updateMessageLog(logMsg, inputMessageLog, "input-message-log");
};

var outputMessageLog = [];

export const updateOutputMessageLog = (logMsg) => {
  updateMessageLog(logMsg, outputMessageLog, "output-message-log");
};
