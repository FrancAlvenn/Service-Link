import {database} from "../database.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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

// Middleware to handle image upload
const uploadProfileImage = upload.single('profileImage');

//Export register endpoint for use un routes
export const register = (req, res) => {
    // Use multer middleware to handle the file upload
    uploadProfileImage(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to upload image' });
        }

        // Check if existing users
        const query = "SELECT * FROM users WHERE email = ?";
        database.query(query, [req.body.email], (err, data) => {
            if (err) return res.json(err);

            if (data.length) return res.status(409).json("User already exists!");

            // Encrypt the password (HASH)
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            // Prepare the SQL query to insert user data
            let insertQuery = "INSERT INTO users (`first_name`, `last_name`, `email`, `password`, `role`, `profile_image_id`, `department_id`, `contact_number`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            const values = [
                req.body.first_name,
                req.body.last_name,
                req.body.email,
                hash,
                req.body.role,
                null, // Default to null if no image is uploaded
                req.body.department_id,
                req.body.contact_number
            ];

            // Insert user data into the database
            database.query(insertQuery, values, (err, result) => {
                if (err) return res.status(500).json(err);
                
                const newUserId = result.insertId; // Get the new user ID

                // If an image was uploaded, save its path to the database
                if (req.file) {
                    const imageInsertQuery = "INSERT INTO images (`file_path`, `file_name`, `uploaded_by`, `uploaded_at`) VALUES (?, ?, ?, NOW())";
                    const imageValues = [req.file.path, req.file.filename, newUserId];

                    // Insert image record into the database
                    database.query(imageInsertQuery, imageValues, (err, imageResult) => {
                        if (err) return res.status(500).json({ error: err });

                        // Use the new image ID in the user insert query if needed
                        // For example, update the user record with the new profile image ID
                        const updateUserQuery = "UPDATE users SET profile_image_id = ? WHERE user_id = ?";
                        database.query(updateUserQuery, [imageResult.insertId, newUserId], (err) => {
                            if (err) return res.status(500).json(err);
                            return res.status(200).json("User has been created with profile image!");
                        });
                    });
                } else {
                    return res.status(200).json("User has been created without a profile image!");
                }
            });
        });
    });
};


export const login = (req,res) => {
    //Check if user exists or not
    const query = "SELECT * FROM users WHERE `email` = ?"

    database.query(query, [req.body.email], (error,data) =>{
        if (error) return res.json(error);

        if(data.length === 0) return res.status(404).json("User not found! ");

        //Check password
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);

        if(!isPasswordCorrect) return res.status(400).json("Incorrect Username or Password!");

        //Cookie Parser -- creates a token that is stored in the cookie
        //This is used so that whenever we delete or update a post it would first check the
        //token to see if that post belongs to the user
        //only the id, username, and name are part of the token
        const token = jwt.sign({id: data[0].id}, "jwtkey"); //jwtkey is a secret key that can be changed accordingly
        //removes the password from the data
        const {password, ...other} = data[0];

        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json(other) //other is information without the password
    });
};

//Logout and remove the cookies
export const logout = (req,res) => {
    res.clearCookie("access_token",{
        sameSite: "none",
        secure: true,
    }).status(200).json("User has been logged out!")
}