import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload file on the cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //successfully uploaded unlink temp files
    fs.unlinkSync(localFilePath);
    console.log("File uploaded on the cloudinary", response.url);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    console.log(err); // unlink the local file saved temporary on the server as upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
