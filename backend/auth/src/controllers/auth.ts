import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from 'zod';
import { redisClient } from "../config/Cache/RedisClient";
import { logger } from "../utils/logger";
import { postgresClient } from "../config/DB/db";
import { generateUniqueId } from "../utils/id";
import { generateToken } from "../utils/jwt";
import { rabbitMQClientPromise } from "../config/Brokers/RabbitMQClient";

// Define a schema
const userSchema = z.object({
    email: z.string().email(),
    password: z.string()
});


/**
 * @description Handles user registration  
 * @route POST /auth/register  
 * 
 * ✔ Validates request payload using Zod  
 * ✔ Checks if the user already exists in the cache  
 * ✔ Queries the database for an existing user  
 * ✔ Generates a unique user ID  
 * ✔ Stores user data in the cache  
 * ✔ Publishes user registration event to Pub/Sub  
 */


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = userSchema.parse(req.body);
        logger.info({ message: "Auth: Register request received", email });

        const cacheKey = `user:${email}`;
        const existingUserCache = await redisClient.get(cacheKey);

        if (existingUserCache) {
            logger.warn({ message: "Auth Register: User already exists (Cache)", email });
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const client = await postgresClient.connect();
        const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
        client.release();

        if (result.rows.length > 0) {
            logger.warn({ message: "Auth Register: User already exists (DB)", email });

            await redisClient.set(
                cacheKey,
                JSON.stringify({
                    email: result.rows[0].email,
                    password: result.rows[0].password,
                    id: result.rows[0].id.toString() // Convert id to string because of BigInt
                }),
                "EX",
                86400
            );

            res.status(400).json({ message: "User already exists" });
            return;
        }

        const userId = generateUniqueId();
        logger.info({ message: "Auth Register: Register approved", email, userId });

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = { id: userId.toString(), email, password: hashedPassword };
        await redisClient.set(cacheKey, JSON.stringify(userData), "EX", 86400);
        logger.info({ message: "Auth Register: User cached", email, userId });

        // PubSub
        await (await rabbitMQClientPromise).registerUser(userId, email, hashedPassword);
        logger.info({ message: "Auth Register: send to pubsub for register", email, userId });

        // Generate JWT token
        const token = generateToken({ id: userId.toString(), email });
        logger.info({ message: "Auth Register: Token generated", email, userId });

        res.status(201).json({ message: "User registered successfully", token });
        logger.info({ message: "Auth Register: User successfully registered", email, userId });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error({ message: "Error during registration", error: error.message, stack: error.stack });
        } else {
            logger.error({ message: "Error during registration", error: String(error) });
        }
        res.status(500).json({ message: "Internal server error" });
    }    
};


interface UserCache{
    email: string,
    password: string,
    id: string
}

/**
 * @desc Authenticate and log in a user
 * @route POST /auth/login
 * @access Public
 *
 * ✔ Validate input using Zod
 * ✔ Check Redis cache for user data and validate password
 * ✔ If not in cache, check PostgreSQL database for user and validate password
 * ✔ Generate and return authentication token on successful login
 */

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = userSchema.parse(req.body);
        logger.info({ message: "Auth: Login request received", email });

        const cacheKey = `user:${email}`;
        const existingUserCache = await redisClient.get(cacheKey);
        let userId = null;
        
        if (existingUserCache) {
            logger.info({ message: "Auth Login: found in Cache", email });
            
            const user: UserCache =  JSON.parse(existingUserCache);
            const passwordMatched = await bcrypt.compare(password, user.password);
            
            if(!passwordMatched){
                logger.warn({ message: "Auth Login: Invalid credentials (Cache)", email });
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            userId = Number(user.id);
        }

        const client = await postgresClient.connect();
        const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
        client.release();

        if (result.rows.length > 0) {
            logger.info({ message: "Auth Login: found in DB", email });

            const passwordMatched = await bcrypt.compare(password, result.rows[0].password);
            if(!passwordMatched){
                logger.warn({ message: "Auth Login: Invalid credentials (DB)", email });
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            await redisClient.set(
                cacheKey,
                JSON.stringify({
                    email: result.rows[0].email,
                    password: result.rows[0].password,
                    id: result.rows[0].id.toString() // Convert id to string because of BigInt
                }),
                "EX",
                86400
            );

            userId = result.rows[0].id;
        }

        logger.info({ message: "Auth: Login approved", email, userId });

        // Generate JWT token
        const token = generateToken({ id: userId.toString(), email });
        logger.info({ message: "Auth Login: Token generated", email, userId });

        res.status(201).json({ message: "User login successfully", token });
        logger.info({ message: "Auth: User succesfully loggedIn", email, userId });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error({ message: "Error during login", error: error.message, stack: error.stack });
        } else {
            logger.error({ message: "Error during login", error: String(error) });
        }
        res.status(500).json({ message: "Internal server error" });
    }
    
};