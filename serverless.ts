import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  org: "tjcompany",
  app: "mancomm-proj",
  service: "mancomm-proj",
  frameworkVersion: "3.38.0",
  configValidationMode: "error",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    region: "us-east-1",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["rds-db:connect"],
        Resource:
          "arn:aws:rds-db:us-east-1:723966483554:dbuser:9e85153a-cc6e-4477-b1b8-a57dcb272a83/mancommprojlambda",
      },
      {
        Effect: "Allow",
        Action: ["secretsmanager:GetSecretValue"],
        Resource:
          "arn:aws:secretsmanager:us-east-1:723966483554:secret:mancommproj-docdb",
      },
      {
        Effect: "Allow",
        Action: ["s3:PutObject"],
        Resource: "arn:aws:s3:::mancomm-docs-bucket/*",
      },
      {
        Effect: "Allow",
        Action: ["s3:GetObject"],
        Resource: "arn:aws:s3:::mancomm-docs-bucket/*",
      },
    ],
  },
  functions: {
    ingest: {
      handler: "src/ingest.handler",
      events: [],
      timeout: 900,
      memorySize: 3008,
      vpc: {
        securityGroupIds: [{ Ref: "MyLambdaSecurityGroup" }],
        subnetIds: [
          "subnet-0b047b7335230f25c",
          "subnet-0e6487d434fe399e4",
          "subnet-0f0e718973c871f7f",
        ],
      },
    },
    parse: {
      handler: "src/parse.handler",
      events: [],
      timeout: 900,
      memorySize: 3008,
      vpc: {
        securityGroupIds: [{ Ref: "MyPrivateLambdaSecurityGroup" }],
        subnetIds: ["subnet-0b047b7335230f25c", "subnet-0e6487d434fe399e4"],
      },
    },
    search: {
      handler: "src/search.handler",
      events: [
        {
          http: {
            path: "search",
            method: "get",
            request: {
              parameters: {
                querystrings: {
                  q: true,
                },
              },
            },
          },
        },
      ],
      vpc: {
        securityGroupIds: [{ Ref: "MyPrivateLambdaSecurityGroup" }],
        subnetIds: ["subnet-0b047b7335230f25c", "subnet-0e6487d434fe399e4"],
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      external: ["aws-sdk"],
      target: "node18",
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      MyLambdaSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
          GroupDescription: "Security group for Lambda function",
          VpcId: "vpc-068b024434e024dd2",
          SecurityGroupIngress: [
            {
              IpProtocol: "tcp",
              FromPort: 27017,
              ToPort: 27017,
              CidrIp: "0.0.0.0/0",
            },
          ],
        },
      },
      MyPrivateLambdaSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
          GroupDescription: "Security group for Lambda function",
          VpcId: "vpc-068b024434e024dd2",
          SecurityGroupIngress: [
            {
              IpProtocol: "tcp",
              FromPort: 27017,
              ToPort: 27017,
              CidrIp: "0.0.0.0/0",
            },
          ],
        },
      },
      MyDocumentDBSecurityGroup: {
        Type: "AWS::EC2::SecurityGroup",
        Properties: {
          GroupDescription: "Security group for DocumentDB cluster",
          VpcId: "vpc-068b024434e024dd2",
          SecurityGroupIngress: [
            {
              IpProtocol: "tcp",
              FromPort: 27017,
              ToPort: 27017,
              SourceSecurityGroupId: {
                Ref: "MyPrivateLambdaSecurityGroup",
              },
            },
          ],
        },
      },
      MyS3Bucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "mancomm-docs-bucket",
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
