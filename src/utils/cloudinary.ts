import cloudinary from "cloudinary";
import { sendEmailToAdmin } from "./Mailer/Mailer";

// if (
//   !process.env.CLOUDINARY_CLOUD_NAME ||
//   !process.env.CLOUDINARY_API_KEY ||
//   !process.env.CLOUDINARY_API_SECRET
// ) {
//   await sendEmailToAdmin(
//     "Error in uploading image to Cloudinary",
//     "error",
//     "Error in uploading image to Cloudinary",
//     "Cloudinary credentials are not set"
//   );
//   throw new Error("Cloudinary credentials are not set");
// }


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dlatjfpao",
  api_key: process.env.CLOUDINARY_API_KEY || "699893394261332",
  api_secret: process.env.CLOUDINARY_API_SECRET || "_vFIYsvtBOQUXZ1ZQeYIgD-ESv0",
});

export const uploadImage = async (imageData: string) => {
  if (!imageData) {
    await sendEmailToAdmin(
      "Error in uploading image to Cloudinary",
      "error",
      "Error in uploading image to Cloudinary",
      "Image data is required"
    );
    throw new Error("Image data is required");
  }
  if (!imageData.startsWith("data:image")) {
    await sendEmailToAdmin(
      "Error in uploading image to Cloudinary",
      "error",
      "Error in uploading image to Cloudinary",
      "Invalid image data"
    );
    throw new Error("Invalid image data");
  }
  const image = Buffer.from(imageData, "base64");
  const result = await cloudinary.v2.uploader.upload(image.toString(), {
    resource_type: "image",
    folder: "questionsImages",
  });
  return result.secure_url;
};

export const deleteImage = async (publicId: string) => {
  await cloudinary.v2.uploader.destroy(publicId);
};

const Cloudinary = {
  uploadImage,
  deleteImage,
};

export default Cloudinary;
