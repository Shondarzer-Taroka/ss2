import { Response, Request } from 'express';
import { db } from '../config/db';
import { User } from '../types/User'; // Import the User type
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import jwt from "jsonwebtoken";

import { RowDataPacket } from 'mysql2';  // assuming you're using mysql2

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Use env variable for security


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, username, email, photo, role, mobileNumber, password }: User = req.body;
        
        // Input validation
        if (!name || !username || !email || !role || !password) {
            res.status(400).json({ error: 'Name, username, email, role, and password are required' });
            return;
        }

        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for hashing
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Ensure the users table exists with the correct schema
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                photo VARCHAR(255),
                role VARCHAR(50) NOT NULL,
                mobileNumber VARCHAR(15),
                password VARCHAR(255) NOT NULL
            )
        `);

        // Insert the new user into the users table
        const [result] = await db.query(
            'INSERT INTO users (name, username, email, photo, role, mobileNumber, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, username, email, photo, role, mobileNumber, hashedPassword]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: (result as any).insertId,
                name,
                username,
                email,
                photo,
                role,
                mobileNumber,
            },
        });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};








export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, password }: { identifier: string; password: string } = req.body;

        if (!identifier || !password) {
            res.status(400).json({ error: "Username/Mobile and password are required" });
            return;
        }

        // Find user by username or mobileNumber
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM users WHERE username = ? OR mobileNumber = ?",
            [identifier, identifier]
        );

        const users: User[] = rows as User[];  // Cast RowDataPacket[] to User[] here

        if (users.length === 0) {
            res.status(401).json({ error: "Invalid username or mobile number" });
            return;
        }

        const user = users[0];

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid password" });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
            expiresIn: "1d",
        });

        // Return user details (excluding password) and token
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                photo: user.photo,
                role: user.role,
                mobileNumber: user.mobileNumber,
            },
        });
    } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
    }
};
