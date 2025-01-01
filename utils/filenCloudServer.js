import { FilenSDK } from "@filen/sdk";
import path from "path";
import os from "os";

let filen = null;
let isInitialized = false;

// Initialize the SDK and create the profile pictures directory
const initializeFilenSDK = async () => {
    if (!isInitialized) {
        try {
            // Debug: Check environment variables
            console.log('Environment check:');
            console.log('FILEN_EMAIL exists:', !!process.env.FILEN_EMAIL);
            console.log('FILEN_PASSWORD exists:', !!process.env.FILEN_PASSWORD);

            if (!process.env.FILEN_EMAIL || !process.env.FILEN_PASSWORD) {
                throw new Error('Missing Filen credentials in environment variables');
            }

            // Initialize SDK first
            filen = new FilenSDK({
                metadataCache: true,
                connectToSocket: true,
                tmpPath: path.join(os.tmpdir(), "filen-sdk")
            });

            // Then login with credentials
            await filen.login({
                email: process.env.FILEN_EMAIL,
                password: process.env.FILEN_PASSWORD
            });

            // Create profile-pictures directory if it doesn't exist
            try {
                await filen.fs().stat({
                    path: "/profile-pictures"
                });
            } catch {
                await filen.fs().mkdir({
                    path: "/profile-pictures"
                });
            }

            isInitialized = true;
            console.log("Successfully initialized Filen SDK");
        } catch (error) {
            console.error("Failed to initialize Filen SDK:", error);
            isInitialized = false;
            filen = null;
            throw error;
        }
    }
    return filen;
};

// Upload a profile picture and return its cloud path
export const uploadProfilePicture = async (fileBuffer, userId) => {
    try {
        // Ensure SDK is initialized
        const filenInstance = await initializeFilenSDK();
        
        const fileName = `${userId}-${Date.now()}.jpg`;
        const filePath = `/profile-pictures/${fileName}`;

        // Write the file to Filen cloud using writeFile
        await filenInstance.fs().writeFile({
            path: filePath,
            content: fileBuffer
        });

        return filePath;
    } catch (error) {
        console.error("Failed to upload profile picture:", error);
        throw error;
    }
};

// Get a profile picture
export const getProfilePicture = async (filePath) => {
    try {
        // Ensure SDK is initialized
        const filenInstance = await initializeFilenSDK();
        
        // Read file using readFile
        const fileBuffer = await filenInstance.fs().readFile({
            path: filePath
        });
        return fileBuffer;
    } catch (error) {
        console.error("Failed to get profile picture:", error);
        throw error;
    }
};

// Initialize the SDK when the file is imported
initializeFilenSDK().catch(console.error);
