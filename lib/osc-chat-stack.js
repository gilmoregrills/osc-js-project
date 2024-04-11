const { Stack, Duration } = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");

class OscChatStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new s3.Bucket(this, "TestBucket", {
      versioned: true,
      autoDeleteObjects: true,
    });
  }
}

module.exports = { OscChatStack };
