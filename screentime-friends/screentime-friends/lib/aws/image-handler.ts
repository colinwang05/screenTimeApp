import axios from "axios";

export async function getPresignedUrl(fileName: string, fileType: string) {
  const res = await axios.get(
    `https://55a5esch9k.execute-api.us-east-1.amazonaws.com/dev/presigned-url?fileName=${fileName}&fileType=${fileType}`
  );
  return res.data.uploadUrl as string;
}

export async function uploadToS3(uri: string, uploadUrl: string, fileType: string) {
  const response = await fetch(uri);
  let blob = await response.blob();

  // Force correct MIME type to match the presigned URL
  blob = blob.slice(0, blob.size, fileType);

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": fileType,
    },
    body: blob,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ S3 error response:", errText);
    throw new Error("Failed to upload image to S3");
  }

  return uploadUrl.split("?")[0];
}

