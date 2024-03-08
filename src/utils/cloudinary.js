import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_KEY, 
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const uplodOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload file on the cloudinary
        const response = cloudinary.uploader.upload(localFilePath,  {
            resource_type : "auto"
        })
        //successfully uploaded
        console.log("File uploaded on the cloudinary", (await response).url);
        return response
    } catch(err) {
        fs.unlink(localFilePath) // unlink the local file saved temporary on the server as upload operation got failed
        return null
    }
}

export {uplodOnCloudinary}