import { describe, expect, it } from "bun:test";
import server from "../index";

describe('GET /', () => {
    it('server check', async () => {
        const app = await server();
        const response = await app.handle(
            new Request('http://localhost:8000/sessions')
        );
        expect(response.status).toBe(200);
    });
});