import { Response, Request } from 'express';
import { db } from '../config/db';
import { User } from '../types/User'; // Import the User type
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing

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