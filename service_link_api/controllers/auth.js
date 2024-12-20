import sequelize from "../database.js";
import UserModel from "../models/UserModel.js";
import ImageModel from "../models/ImageModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import Image from "../models/ImageModel.js";
import { Op } from 'sequelize';

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
                access_level: req.body.access_level,
                immediate_head: req.body.immediate_head,
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
    console.log(req.body)
    try {
        // Check if the user exists by email or username
        const user = await UserModel.findOne({
            where: {
                [Op.or]: [
                    { username: req.body.username },  // Check by username
                    { email: req.body.username }      // Check by email (use the same input for both fields)
                ]
            }
        });
        if (!user) return res.status(404).json("User not found!");

        // Verify password
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
        if (!isPasswordCorrect) return res.status(400).json("Incorrect Username or Password!");

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

        // Set the cookie and respond
        res.cookie("access_token", token, { httpOnly: true })
           .status(200)
           .json(response); // Send user data without password

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
