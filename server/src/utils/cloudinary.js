import { v2 as cloud } from "cloudinary";
import fs from 'fs'

cloud.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        let response;

        if (!localFilePath) return null;

        if (fs.existsSync(localFilePath)) {
            response = await cloud.uploader.upload(localFilePath, { resource_type: "auto", folder: "lth-painting-files", });
            console.log("file is uploaded on cloudinary sdk : ", response.secure_url);
            fs.unlinkSync(localFilePath)//remove the locally saved temporary files as the upload operation got successfull
        }else{
            throw new ApiError(400, "File path is not found !!");
        }

        return response;
        // return response.secure_url; // ✅ returning HTTPS URL
    }
    catch (err) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)//remove the locally saved temporary files as the upload operation got failed
        }
        return null;
    }
}

const deleteCloudinary = async (cloudinaryFilePath) => {
    try {
        //Getting public Id
        const publicId = String(cloudinaryFilePath.split("/").pop().split(".")[0]);
        //Validating Public ID
        if (!publicId) {
            return console.log("No public Id present");
        }
        const result = await cloud.uploader.destroy(publicId);
        console.log(result)

    } catch (error) {
        console.log(error.message);
    }
}

export { uploadOnCloudinary, deleteCloudinary };