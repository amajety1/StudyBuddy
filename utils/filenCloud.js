import { FilenSDK } from "@filen/sdk";
import path from "path";
import os from "os";

const filen = new FilenSDK({
    metadataCache: true,
    connectToSocket: true,
    tmpPath: path.join(os.tmpdir(), "filen-sdk")
});

// Initialize the SDK and create the profile pictures directory
export const initializeFilenSDK = async () => {
    try {
        await filen.login({
            email: "aniketstoic@gmail.com",
            password: "Pf7gLaEX2K4$kPw"
        });

        // Create profile-pictures directory if it doesn't exist
        try {
            await filen.fs().stat({ path: "/profile-pictures" });
        } catch {
            await filen.fs().mkdir({ path: "/profile-pictures" });
        }
    } catch (error) {
        console.error("Failed to initialize Filen SDK:", error);
        throw error;
    }
};

// Upload a profile picture and return its cloud path
export const uploadProfilePicture = async (fileBuffer, userId) => {
    try {
        const fileName = `${userId}-${Date.now()}.jpg`;
        const filePath = `/profile-pictures/${fileName}`;

        // Write the file to Filen cloud
        await filen.fs().writeFile({
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
        const fileBuffer = await filen.fs().readFile({
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
