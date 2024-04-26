const { Stack, Duration } = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const ec2 = require("aws-cdk-lib/aws-ec2");
const { DockerImageAsset, Platform } = require("aws-cdk-lib/aws-ecr-assets");
const path = require("path");
const { Role, ServicePrincipal } = require("aws-cdk-lib/aws-iam");
const readFileSync = require("fs").readFileSync;
const r53 = require("aws-cdk-lib/aws-route53");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const ssm = require("aws-cdk-lib/aws-ssm");

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

    const vpc = new ec2.Vpc(this, `Vpc`, {
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

    const dockerImage = new DockerImageAsset(this, `DockerImage`, {
      directory: path.basename(path.dirname(".")),
      platform: Platform.LINUX_AMD64,
    });

    const sg = new ec2.SecurityGroup(this, `Sg`, {
      vpc,
      description: "allows inbound traffic",
      allowAllOutbound: true,
    });

    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8081));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(57121));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));

    const eip = new ec2.CfnEIP(this, `Eip`);

    const zone = r53.HostedZone.fromLookup(this, `Zone`, {
      domainName: "eelgirl.biz",
    });

    const record = new r53.ARecord(this, `ARecord`, {
      zone: zone,
      recordName: "osc-chat.eelgirl.biz",
      target: r53.RecordTarget.fromIpAddresses(eip.ref),
    });

    const instance = new ec2.Instance(this, `WebServer`, {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      securityGroup: sg,
      userDataCausesReplacement: true,
      userData: ec2.UserData.custom(
        readFileSync(`${__dirname}/assets/userdata.yaml`, "utf-8")
          .replaceAll("${domain}", record.domainName)
          .replaceAll("${docker_image}", dockerImage.imageUri),
      ),
    });

    dockerImage.repository.grantPull(instance);

    const ec2Assoc = new ec2.CfnEIPAssociation(this, `EipAssoc`, {
      eip: eip.ref,
      instanceId: instance.instanceId,
    });

    const table = new dynamodb.Table(this, `ConfigurationMessagesTable`, {
      partitionKey: {
        name: "channelAndGroup",
        type: dynamodb.AttributeType.STRING,
      },
    });
    table.grantReadWriteData(instance);

    const tableNameSSMParam = new ssm.StringParameter(
      this,
      `TableNameSSMParam`,
      {
        parameterName: "/osc-chat/dynamodb-table-name",
        stringValue: table.tableName,
      },
    );
    tableNameSSMParam.grantRead(instance);
  }
}

module.exports = { OscChatStack };
