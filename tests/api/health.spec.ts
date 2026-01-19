import { test, expect } from '@playwright/test';

test.describe('Restful Booker - Health Checks', () => {
    let baseURL: string;

    test.beforeEach(async () => {
        baseURL = process.env.BASE_URL || 'http://localhost:3000';
    });

    test('should respond to /ping with 201', async ({ request }) => {
        const response = await request.get(`${baseURL}/ping`);
        expect(response.status()).toBe(201);
    });

    test('should return 404 for non-existent routes', async ({ request }) => {
        const response = await request.get(`${baseURL}/foo/bar`);
        expect(response.status()).toBe(404);
    });
});