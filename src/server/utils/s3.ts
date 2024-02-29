import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY ?? "";
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY ?? "";
const AWS_REGION = process.env.AWS_REGION ?? "";
const S3_BUCKET = process.env.CRUX_PUBLIC_BUCKET ?? "";

const client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

export const uploadFile = async (fileName: string, data: string) => {
  try {
    const _type = fileName.split(".").pop() ?? "";
    if (!["jpeg", "jpg", "png"].includes(_type)) {
      throw new Error("Unsupported file type. Only supports jpeg/png.");
    }
    const type = _type === "jpg" ? "jpeg" : _type;
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: fileName,
        Body: Buffer.from(
          data.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        ),
        ContentEncoding: "base64",
        ContentType: `image/${type}`,
        ACL: "public-read",
      })
    );
    return {
      fileUrl: `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`,
    };
  } catch (e) {
    throw new Error("Failed to upload to S3");
  }
};