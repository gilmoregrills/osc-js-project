const express = require("express");

require("./osc");

const app = express();
const port = 8080;
server = app.listen(port, () => {
  console.log(`Express listening on port ${port}.`);
});

app.use(express.static("dist"));
app.use(express.json());

require("./routes")(app);
