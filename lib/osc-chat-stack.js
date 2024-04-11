const { Stack, Duration } = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const ec2 = require("aws-cdk-lib/aws-ec2");
const { DockerImageAsset } = require("aws-cdk-lib/aws-ecr-assets");
const path = require("path");

class OscChatStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */

  constructor(scope, id, props) {
    super(scope, id, props);
    const name = "OscChat";

    const vpc = new ec2.Vpc(this, `${name}Vpc`, {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 20,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const dockerImage = new DockerImageAsset(this, `${name}DockerImage`, {
      directory: path.basename(path.dirname(".")),
    });
  }
}

module.exports = { OscChatStack };
