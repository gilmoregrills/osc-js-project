const path = require("path");

var config = {
  entry: "./src/client/index.js",
  watch: false,
  optimization: {
    minimize: true,
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      child_process: false,
      fs: false,
      dgram: false,
      // and also other packages that are not found
    },
  },
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    config.watch = true;
    config.optimization.minimize = false;
  }

  return config;
};
