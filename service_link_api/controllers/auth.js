import sequelize from "../database.js";
import UserModel from "../models/UserModel.js";
import ImageModel from "../models/ImageModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import Image from "../models/ImageModel.js";
import { Op } from 'sequelize';
import UserPreference from '../models/SettingsModels/UserPreferenceModel.js';

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + " - " + file.originalname);
    }
});

// Create the multer upload instance
const upload = multer({ storage: storage });
const uploadProfileImage = upload.single('profileImage'); // Middleware to handle image upload

// Generate a unique reference number (e.g., DYCI-2024-0001)
function generateReferenceNumber(lastUserId) {
    const year = new Date().getFullYear();
    const uniqueNumber = String(lastUserId + 1).padStart(5, '0');
    return `DYCI-${year}-${uniqueNumber}`;
};

// Register function
export const register = async (req, res) => {
    uploadProfileImage(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to upload image' });
        }

        try {
            // Check if the user already exists by email or username
            const existingUser = await UserModel.findOne({
                where: {
                    [Op.or]: [
                        { username: req.body.username },  // Check by username
                        { email: req.body.email }      // Check by email (use the same input for both fields)
                    ]
                }
            });
            if (existingUser) return res.status(409).json("User with the same email or username already exists!");

            // Encrypt the password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            // Generate a unique reference number
            const lastUser = await UserModel.findOne({ order: [['user_id', 'DESC']] });
            const referenceNumber = generateReferenceNumber(lastUser ? lastUser.user_id : 0);

            // Create the user without a profile image at first
            console.log(referenceNumber)
            const newUser = await UserModel.create({
                reference_number: referenceNumber,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                email: req.body.email,
                password: hash,
                contact_number: req.body.contact_number,
                organization: req.body.organization,
                department: req.body.department,
                designation: req.body.designation,
                access_level: req.body.access_level || 'user', //change this later to 'user' -- 'admin' will be used for development
                immediate_head: req.body.immediate_head,
                status: 'active',
                profile_image_id: null // Set profile image ID to null initially
            });

            // If an image was uploaded, save its path to the Image table
            if (req.file) {
                const newImage = await ImageModel.create({
                    file_path: req.file.path,
                    file_name: req.file.filename,
                    uploaded_by: newUser.user_id
                });

                // Update the user's profile_image_id
                await newUser.update({ profile_image_id: newImage.image_id });

                 //Create the user_preference
                await UserPreference.create({ user_id: newUser.id });

                return res.status(200).json("User has been created with profile image!");
            } else {
                return res.status(200).json("User has been created without a profile image!");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            return res.status(500).json({ error: "Failed to register user" });
        }
    });
};

// Login function
export const login = async (req, res) => {
    try {
        // Check if the user exists by email or username
        const user = await UserModel.findOne({
            where: {
                [Op.or]: [
                    { username: req.body.email },  // Check by username
                    { email: req.body.email }      // Check by email (use the same input for both fields)
                ]
            }
        });
        if (!user) return res.status(404).json("Account not activated, Please contact GSO office for account activation.");

        // Check if the user is active
        if (user.status !== 'active') return res.status(401).json("Account not activated, Please contact GSO office for account activation.");

        // Verify password
        // No user password is found meaning they initially used the google login
        if (!user.password) return res.status(401).json("Incorrect Username or Password!");

        // Has a password then check if the password is correct
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
        if (!isPasswordCorrect) return res.status(401).json("Incorrect Username or Password!");

        //Include Image Path
        const image = await ImageModel.findOne({ where: { image_id: user.profile_image_id } });

        // Generate JWT token
        const token = jwt.sign({ id: user.user_id }, "jwtkey"); // jwtkey is a secret key that can be changed accordingly
        const { password, ...other } = user.toJSON(); // Exclude the password from the response

        // Create a response object with user data and image path
        const response = {
            ...other,
            profileImage: image ? image.file_path : null // Include image path or null if no image found
        };

        //Get the user_preference
        const userPreference = await UserPreference.findOne({ where: { user_id: user.reference_number } });

        // Set the cookie and respond
        res.cookie("access_token", token, { httpOnly: true, sameSite: "none", secure: false })
           .status(200)
           .json(response, userPreference); // Send user data without password

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Failed to log in" });
    }
};

// Logout function
export const logout = (req, res) => {
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true,
    }).status(200).json("User has been logged out!");
};


//Google Authentication
export const googleAuth = async (req, res) => {
    try {
        //Check if the user already has a google_id in the database
        const existingUser = await UserModel.findOne({
            where: {
                google_id: req.body.google_id
            }
        });

        // Check if the user is active
        if (existingUser && existingUser.status !== 'active') return res.status(201).json("Account not activated, Please contact GSO office for account activation.");

        // Check if the user already has a google_id in the database
        if(existingUser){
            const token = jwt.sign({ id: existingUser.user_id }, "jwtkey");

            //Include Image Path
            const image = await ImageModel.findOne({ where: { image_id: existingUser.profile_image_id } });

            // Create a response object with user data and image path
            const response = {
                ...existingUser,
                profileImage: image ? image.file_path : null // Include image path or null if no image found
            };

            //Get the user preference
            const userPreference = await UserPreference.findOne({ where: { user_id: existingUser.reference_number } });


            return res.cookie("access_token", token, { httpOnly: true })
                .status(200)
                .json({response, userPreference});
        }


        // Check if the user exists by email but does not have a google_id
        const userWithNoGoogleId = await UserModel.findOne({
            where: {
                email: req.body.email
            }
        });

        if(userWithNoGoogleId){
            await UserModel.update(
                {
                    google_id: req.body.google_id
                },
                {
                    where: { email: req.body.email }
                }
            );

            const token = jwt.sign({ id: userWithNoGoogleId.user_id }, "jwtkey");

            //Include Image Path
            const image = await ImageModel.findOne({ where: { image_id: userWithNoGoogleId.profile_image_id } });

            // Create a response object with user data and image path
            const response = {
                ...userWithNoGoogleId,
                profileImage: image ? image.file_path : null // Include image path or null if no image found
            };

            return res.cookie("access_token", token, { httpOnly: true, sameSite: "none", secure: false })
                .status(200)
                .json({response});
        }

        //If user doesn't exist, create an account but with a pending status
        const lastUser = await UserModel.findOne(
            { order: [['user_id', 'DESC']]
        });

        const referenceNumber = generateReferenceNumber(lastUser ? lastUser.user_id : 0);

        const newUser = await UserModel.create({
            reference_number: referenceNumber,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            username: req.body.email,
            google_id: req.body.google_id,
            access_level: 'user', //change this later to 'admin' -- 'admin' will be used for development
            status: "active", //change later to pending
            archived: false,
        });

        //Create the user_preference and it doesn't already exists
        const userPreference = await UserPreference.findOne({ where: { user_id: referenceNumber } });
        if(!userPreference){
            await UserPreference.create({ user_id: referenceNumber });
        }

        return res.status(201).json("Account not activated, Please contact GSO office for account activation.");

    } catch (error) {
        console.error("Error during Google Authentication:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

