import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
    // Check if token is provided in cookies or the Authorization header
    const token = req.header("Authorization")?.split(" ")[1] || req.cookies?.access_token;

    if (!token) {
        return res.status(401).json("Unauthorized, no token provided.");
    }

    // Verify the token
    jwt.verify(token, "jwtkey", (err, decoded) => {
        if (err) {
            return res.status(401).json("Unauthorized");
        }
        // Attach decoded user data to the request object for access in later middleware/routes
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    });
};
