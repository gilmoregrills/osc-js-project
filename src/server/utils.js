const { uniqueNamesGenerator, names } = require("unique-names-generator");
const ipInt = require("ip-to-int");
const { fromSSO } = require("@aws-sdk/credential-provider-sso");
const { fromInstanceMetadata } = require("@aws-sdk/credential-providers");

module.exports = {
  generateNameFromIp: (ip) => {
    const seed = ipInt(ip).toInt();
    return uniqueNamesGenerator({
      dictionaries: [names],
      seed: seed,
    }).toLowerCase();
  },

  getAWSCredentialsDependingOnEnvironment: () => {
    if (process.env.NODE_ENV == "production") {
      return fromInstanceMetadata()();
    } else {
      return fromSSO({ profile: "osc-chat" })();
    }
  },
};
