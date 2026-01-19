import { test, expect } from '@playwright/test';
import { BookingHelpers, BookingResponse } from '../../helpers/bookingHelpers';
import { payload1 } from '../../fixtures/payloads';

test.describe('Restful Booker - DELETE /booking', () => {
    let helpers: BookingHelpers;
    let token: string;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
        token = await helpers.authenticate('admin', 'password123');
    });

    test('should return 403 without authorization', async ({ request }) => {
        const response = await request.delete(`${helpers.baseURL}/booking/1`);
        expect(response.status()).toBe(403);
    });

    test('should return 403 with invalid credentials', async ({ request }) => {
        const invalidToken = await helpers.authenticate('nmida', '321drowssap');

        const response = await request.delete(`${helpers.baseURL}/booking/1`, {
            headers: { 'Cookie': `token=${invalidToken}` }
        });

        expect(response.status()).toBe(403);
    });

    test('should delete existing booking successfully', async () => {
        const create = await helpers.createBooking(payload1);
        const body: BookingResponse = await create.json();
        const bookingID = body.bookingid;

        console.log("Created booking id is:", bookingID);

        const response = await helpers.deleteBooking(bookingID, token);

        expect(response.status()).toBe(201);
    });

    test('should delete booking with Basic Auth', async ({ request }) => {
        const create = await helpers.createBooking(payload1);
        const body: BookingResponse = await create.json();
        const bookingID = body.bookingid;

        console.log("Created booking id is:", bookingID);

        const response = await request.delete(`${helpers.baseURL}/booking/${bookingID}`, {
            headers: { 'Authorization': 'Basic YWRtaW46cGFzc3dvcmQxMjM=' }
        });

        expect(response.status()).toBe(201);
    });

    test('should return 405 for non-existent booking', async () => {
        const response = await helpers.deleteBooking(10000000, token);
        expect(response.status()).toBe(405);
    });
});