import { v2 as cloudinary } from 'cloudinary';
import {config} from "dotenv"
config()

console.log(process.env.CLOUDNINARY_CLOUD)
// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET 
});

export default cloudinary

