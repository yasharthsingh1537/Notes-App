import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";

interface PublicUser{
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

// helper function to get the JWT secret from environment variables
function getJwtSecret(): string {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) throw new Error("JWT secret is not configured in the env file");

    return jwtSecret;
}

// helper function to generate a JWT token for a given user ID
function generateToken(userId: string): string {
    return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "1h" });
}

// helper function to return a public representation of a user object
function publicUser(user: PublicUser) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

// controller function to handle user signup
export async function signup(req: Request, res: Response) {
    const { name, email, password } = req.body ?? {};

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !name.trim() ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        const token = generateToken(user._id.toString());

        return res.status(201).json({
            message: "Account created successfully",
            user: publicUser(user),
            token,
        });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: "Validation failed",
                errors:Object.values(error.errors).map((err) => err.message),
            })
        }

        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 11000
        ) {
            return res.status(409).json({
                message: "User with this email already exists",
            })
        }

        console.error("Error during signup:", error);
        
        return res.status(500).json({
            message: "Internal server error",
        })
    }
}

// controller function to handle user login
export async function login(req: Request, res: Response) {
    const { email, password } = req.body ?? {};

    if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            message: "Email and password are required",
        })
    }

    try {
        const user = await User.findOne({
            email:email.trim().toLowerCase(),
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            })
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            })
        }

        const token = generateToken(user._id.toString());

        return res.status(200).json({
            message: "Login successful",
            user: publicUser(user),
            token,
        })

    } catch (error: unknown) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "Internal server error",
        })
    }
}

// controller function to handle /me route
export async function getMe(_req: Request, res: Response) {
    try {
        const userId = res.locals.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            })
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        return res.status(200).json({
            user: publicUser(user),
        })

    } catch (error: unknown) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            message: "Internal server error",
        })
    }
}