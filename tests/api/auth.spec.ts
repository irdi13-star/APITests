import { test, expect } from '@playwright/test';
import { BookingHelpers, AuthResponse } from '../../helpers/bookingHelpers';

test.describe('Restful Booker - POST /auth', () => {
    let helpers: BookingHelpers;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
    });

    test('should return token for valid credentials', async ({ request }) => {
        const response = await request.post(`${helpers.baseURL}/auth`, {
            data: { username: 'admin', password: 'password123' }
        });
        const body: AuthResponse = await response.json();

        expect(response.status()).toBe(200);
        expect(body).toHaveProperty('token');
        expect(body.token).toMatch(/[a-zA-Z0-9]{15,}/);
    });

    test('should return error for invalid credentials', async ({ request }) => {
        const response = await request.post(`${helpers.baseURL}/auth`, {
            data: { username: 'nimda', password: '321drowssap' }
        });
        const body: AuthResponse = await response.json();

        expect(response.status()).toBe(200);
        expect(body.reason).toBe('Bad credentials');
    });
});