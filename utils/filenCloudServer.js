import { FilenSDK } from "@filen/sdk";
import path from "path";
import os from "os";
import fs from 'fs';

let filen = null;
let isInitialized = false;
let lastLoginAttempt = 0;
const LOGIN_COOLDOWN = 30000; // 30 seconds cooldown

// Initialize the SDK and create the profile pictures directory
const initializeFilenSDK = async (retryCount = 0) => {
    // If SDK is already initialized, reuse it
    if (isInitialized && filen) {
        return filen;
    }

    const now = Date.now();
    if (now - lastLoginAttempt < LOGIN_COOLDOWN) {
        const waitTime = LOGIN_COOLDOWN - (now - lastLoginAttempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    if (!isInitialized) {
        try {
            lastLoginAttempt = Date.now();
            
            // Initialize SDK first
            filen = new FilenSDK({
                metadataCache: true,
                connectToSocket: false, // Disable socket connection to reduce overhead
                tmpPath: path.join(os.tmpdir(), "filen-sdk")
            });

            // Login
            await filen.login({
                email: process.env.FILEN_EMAIL,
                password: process.env.FILEN_PASSWORD
            });

            isInitialized = true;
        } catch (error) {
            isInitialized = false;
            filen = null;
            
            if (error.code === 'rate_limited' && retryCount < 2) {
                console.log(`Rate limited, retrying in ${LOGIN_COOLDOWN}ms... (Attempt ${retryCount + 1}/2)`);
                await new Promise(resolve => setTimeout(resolve, LOGIN_COOLDOWN));
                return initializeFilenSDK(retryCount + 1);
            }
            
            throw error;
        }
    }
    return filen;
};

// Get a profile picture with local caching
export const getProfilePicture = async (filePath, retryCount = 0) => {
    // Create cache directory if it doesn't exist
    const cacheDir = path.join(process.cwd(), 'public', 'profile-pictures-cache');
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Generate cache key from file path
    const cacheKey = filePath.replace(/[^a-zA-Z0-9]/g, '_');
    const cachePath = path.join(cacheDir, cacheKey);

    // Check if file exists in cache
    if (fs.existsSync(cachePath)) {
        console.log('Serving from local cache:', filePath);
        return fs.readFileSync(cachePath);
    }

    try {
        // Ensure SDK is initialized
        const filenInstance = await initializeFilenSDK();
        
        // Read file using readFile
        const fileBuffer = await filenInstance.fs().readFile({
            path: filePath
        });

        // Save to cache
        fs.writeFileSync(cachePath, fileBuffer);
        
        return fileBuffer;
    } catch (error) {
        if (error.code === 'rate_limited' && retryCount < 2) {
            console.log(`Rate limited while getting profile picture, retrying in ${LOGIN_COOLDOWN}ms... (Attempt ${retryCount + 1}/2)`);
            await new Promise(resolve => setTimeout(resolve, LOGIN_COOLDOWN));
            return getProfilePicture(filePath, retryCount + 1);
        }
        
        throw error;
    }
};

// Upload a profile picture and return its cloud path
export const uploadProfilePicture = async (fileBuffer, userId) => {
    try {
        const filenInstance = await initializeFilenSDK();
        
        const fileName = `${userId}-${Date.now()}.jpg`;
        const filePath = `/profile-pictures/${fileName}`;

        await filenInstance.fs().writeFile({
            path: filePath,
            content: fileBuffer
        });

        // Cache the uploaded file immediately
        const cacheDir = path.join(process.cwd(), 'public', 'profile-pictures-cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        const cacheKey = filePath.replace(/[^a-zA-Z0-9]/g, '_');
        const cachePath = path.join(cacheDir, cacheKey);
        fs.writeFileSync(cachePath, fileBuffer);

        return filePath;
    } catch (error) {
        console.error("Failed to upload profile picture:", error);
        throw error;
    }
};

// Initialize the SDK when the file is imported
initializeFilenSDK().catch(console.error);
