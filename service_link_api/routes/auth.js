import express from 'express'
import { register, login, logout } from '../controllers/auth.js';

const router = express.Router();

// Route to create a new account (POST)
router.post("/register", register)

// Route to login an account (POST)
router.post("/login",login)

// Route to logout and account (POST)
router.post("/logout",logout)

export default router