const express = require("express");
const osc = require("./osc");

osc.initialise();

const app = express();
const port = 8080;
server = app.listen(port, () => {
  console.log(`Express listening on port ${port}.`);
});

app.use(express.static("dist"));
app.use(express.json());

require("./routes")(app);
