
const { S3Client, PutBucketAclCommand } = require("@aws-sdk/client-s3");

const ENDPOINT = process.env.B2_ENDPOINT || "";
const REGION = process.env.B2_REGION || "us-east-005";
const ACCESS_KEY = process.env.B2_KEY_ID || "";
const SECRET_KEY = process.env.B2_APP_KEY || "";
const BUCKET = process.env.B2_BUCKET_NAME || "";

const s3 = new S3Client({
    endpoint: ENDPOINT,
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
});

async function makePublic() {
    try {
        console.log(`Setting ACL public-read for bucket: ${BUCKET}`);
        await s3.send(new PutBucketAclCommand({
            Bucket: BUCKET,
            ACL: "public-read"
        }));
        console.log("Success! Bucket should now be public.");
    } catch (error) {
        console.error("Failed to set ACL:", error);
    }
}

makePublic();
