import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const uploadToS3 = async (fileContents: string, fileName: string) => {
  const s3Client = new S3Client({});
  try {
    const bucketName = "mancomm-docs-bucket";
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileContents,
      })
    );
    s3Client.destroy();
  } catch (err) {
    console.log(err);
    s3Client.destroy();
  }
};

const downloadFromS3 = async (fileName: string) => {
  const s3Client = new S3Client({});

  // Create an Amazon S3 bucket. The epoch timestamp is appended
  // to the name to make it unique.
  const bucketName = "mancomm-docs-bucket";
  // Put an object into an Amazon S3 bucket.
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    })
  );
  const htmlFromS3 = await Body?.transformToString();
  s3Client.destroy();
  return htmlFromS3;
};

export default {
  uploadToS3,
  downloadFromS3,
};
