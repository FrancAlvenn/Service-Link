import sequelize from "../database.js";
import UserManagementModel from "../models/UserModel.js";
import { Op } from 'sequelize';
import { createLog } from "./system_logs.js";
import ImageModel from "../models/ImageModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';

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


function generateReferenceNumber(lastRequestId) {
    const year = new Date().getFullYear();
    const uniqueNumber = String(lastRequestId + 1).padStart(5, '0');
    return `DYCI-${year}-${uniqueNumber}`;
};


export async function getAllUsers(req, res) {
    try {
        const users = await UserManagementModel.findAll({
            where: {
                archived: {
                    [Op.eq]: false // Get all that is not archived
                }
            }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message:`Encountered an internal error ${error}` });
    }
}

export async function getUserById(req, res) {
    try{
        const user = await UserManagementModel.findOne({
            where: {
                reference_number: req.params.reference_number,
                archived: {
                    [Op.eq]: false // Get all that is not archived
                }
            }
        })

        //Check is user exists in the database
        if (user === null) {
            res.status(404).json({message : 'Request not found!'});
        } else {
            res.status(200).json({user});
        }
        res.status(200).json(user);
    }catch(error){
        res.status(500).json({ message: `Encountered an internal error ${error}` });
    }
}


export async function createUser(req, res) {
    uploadProfileImage(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to upload image' });
        }

        try {
            // Check if the user already exists by email or username
            const existingUser = await UserManagementModel.findOne({
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
            const lastUser = await UserManagementModel.findOne({ order: [['user_id', 'DESC']] });
            const referenceNumber = generateReferenceNumber(lastUser ? lastUser.user_id : 0);

            // Create the user without a profile image at first
            console.log(referenceNumber)
            const newUser = await UserManagementModel.create({
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
}


export async function updateUserById(req, res) {
    uploadProfileImage(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to upload image", message: `${err}` });
        }

        try {
            // Find the user by reference number
            const user = await UserManagementModel.findOne({
                where: {
                    reference_number: req.params.reference_number,
                    archived: {
                        [Op.eq]: false // Ensure the user is not archived
                    }
                }
            });

            // Check if user exists
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if the email or username is being updated and ensure uniqueness
            if (req.body.email && req.body.email !== user.email) {
                const emailExists = await UserManagementModel.findOne({
                    where: { email: req.body.email }
                });
                if (emailExists) {
                    return res.status(409).json({ message: "Email is already in use by another user" });
                }
            }

            if (req.body.username && req.body.username !== user.username) {
                const usernameExists = await UserManagementModel.findOne({
                    where: { username: req.body.username }
                });
                if (usernameExists) {
                    return res.status(409).json({ message: "Username is already taken by another user" });
                }
            }

            // Update user fields
            const updatedData = {
                first_name: req.body.first_name || user.first_name,
                last_name: req.body.last_name || user.last_name,
                username: req.body.username || user.username,
                email: req.body.email || user.email,
                contact_number: req.body.contact_number || user.contact_number,
                organization: req.body.organization || user.organization,
                department: req.body.department || user.department,
                designation: req.body.designation || user.designation,
                access_level: req.body.access_level || user.access_level,
                immediate_head: req.body.immediate_head || user.immediate_head,
            };

            // Check if a new password is provided; if so, hash it
            if (req.body.password) {
                const salt = bcrypt.genSaltSync(10);
                updatedData.password = bcrypt.hashSync(req.body.password, salt);
            }

            // If a new profile image is uploaded, save it and update the image reference
            if (req.file) {
                // Create a new entry in the Image table
                const newImage = await ImageModel.create({
                    file_path: req.file.path,
                    file_name: req.file.filename,
                    uploaded_by: user.user_id
                });

                // Update the user's profile_image_id with the new image's ID
                updatedData.profile_image_id = newImage.image_id;

                // Optionally, delete the old profile image file (if necessary)
                if (user.profile_image_id) {
                    const oldImage = await ImageModel.findOne({ where: { image_id: user.profile_image_id } });
                    if (oldImage) {
                        // Logic to delete the file from the file system (e.g., `fs.unlink`) could go here
                        await oldImage.destroy();
                    }
                }
            }

            // Update the user in the database
            await user.update(updatedData);

            return res.status(200).json({ message: "User profile updated successfully!" });
        } catch (error) {
            console.error("Error during user update:", error);
            return res.status(500).json({ error: "Failed to update user profile", message: `${error}` });
        }
    });
}





export async function archiveUserById(req, res) {
    try {
        const user = await UserManagementModel.findOne({
            where: {
                reference_number: req.params.reference_number
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.update({ archived: true });
        return res.status(200).json({ message: 'User has been archived' });
    } catch (error) {
        return res.status(500).json({ message: `Encountered an internal error ${error}` });
    }
}

