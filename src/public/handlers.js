const handleControlCodes = (oscMsg) => {
  document.getElementById(`opt_${oscMsg.args[0]}`).textContent =
    `opt: ${oscMsg.args[1]}`;
  document.getElementById("set_opt").textContent =
    `set:channel:/${oscMsg.args[0]}.opt to: ${oscMsg.args[1]}`;
};
