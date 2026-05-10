import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "chat-media" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

    streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};