import { describe, it, expect } from 'vitest';
import axios from 'axios';

const AUTH_URL = "http://localhost:5001/auth";

describe("Auth Service", () => {
    const testUser = {
        email: `testuser${Date.now()}@example.com`,
        password: "Test@1234"
    };

    let token = "";

    it("should register a new user", async () => {
        const response = await axios.post(`${AUTH_URL}/register`, testUser);
        
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("message", "User registered successfully");
        expect(response.data).toHaveProperty("token");
        
        token = response.data.token;
    });

    it("should not register the same user again", async () => {
        try {
            await axios.post(`${AUTH_URL}/register`, testUser);
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty("message", "User already exists");
        }
    });

    it("should log in an existing user", async () => {
        const response = await axios.post(`${AUTH_URL}/login`, testUser);
        
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("message", "User login successfully");
        expect(response.data).toHaveProperty("token");
    });

    it("should not log in with incorrect credentials", async () => {
        try {
            await axios.post(`${AUTH_URL}/login`, { ...testUser, password: "WrongPassword" });
        } catch (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data).toHaveProperty("message", "Invalid credentials");
        }
    });
});
