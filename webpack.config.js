const path = require("path");

module.exports = {
  entry: "./src/index.js",
  watch: true,
  optimization: {
    minimize: false,
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
