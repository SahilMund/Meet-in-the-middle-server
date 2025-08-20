import cloudinary from "../configs/cloudinary.js";
export const deleteAvatarFromCloudinary = async (avatarUrl) => {
  try {
    if (!avatarUrl) return;
    const publicId = avatarUrl.split("/").slice(-2).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    console.log("Old avatar deleted from Cloudinary");
  } catch (error) {
    console.error("Error deleting old avatar:", error);
  }
};
