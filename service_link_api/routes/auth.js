import express from 'express'
import { register, login, logout, googleAuth } from '../controllers/auth.js';

const router = express.Router();

// Route to create a new account (POST)
router.post("/register", register)

// Route to login an account (POST)
router.post("/login", login)

// Route to logout and account (POST)
router.post("/logout", logout)

// Route to google login (POST)
router.post("/google_login", googleAuth)

export default router