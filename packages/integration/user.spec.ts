import { describe, expect, test, it } from 'vitest'
import { axios } from "./axios";

const BACKEND_URL1 = "http://localhost:3000"
const BACKEND_URL2 = "http://localhost:8080"

describe("Health check", () => {

  it('Server1 : TS', async () => {
    const response1 = await axios.get(`${BACKEND_URL1}/health`);
    expect(response1.status).toBe(200);
    expect(response1.data).toEqual({ success: true, message: "server is running." });
  });

  it('Server2: GoLang', async () => {
    const response1 = await axios.get(`${BACKEND_URL2}/health`);
    expect(response1.status).toBe(200);
    expect(response1.data).toEqual({ success: true, message: "Server is running." });
  });

});