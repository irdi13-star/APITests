import { test, expect } from '@playwright/test';
import { BookingHelpers, Booking, BookingResponse } from '../../helpers/bookingHelpers';
import { payload1, payload2 } from '../../fixtures/payloads';

test.describe('Restful Booker - PUT /booking', () => {
    let helpers: BookingHelpers;
    let token: string;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
        token = await helpers.authenticate('admin', 'password123');
        console.log(`Token is: ${token}`);
    });

    test('should return 403 without token', async ({ request }) => {
        const response = await request.put(`${helpers.baseURL}/booking/1`, {
            data: payload2
        });

        expect(response.status()).toBe(403);
    });

    test('should return 403 with invalid credentials', async ({ request }) => {
        const invalidToken = await helpers.authenticate('nmida', '321drowssap');
        await helpers.createBooking(payload1);

        const response = await request.put(`${helpers.baseURL}/booking/1`, {
            data: payload2,
            headers: { 'Cookie': `token=${invalidToken}` }
        });

        expect(response.status()).toBe(403);
    });

    test('should update booking successfully', async () => {
        const createResponse = await helpers.createBooking(payload1);
        const createBody: BookingResponse = await createResponse.json();
        const bookingID = createBody.bookingid;
        
        const response = await helpers.updateBooking(bookingID, payload2, token);
        const body: Booking = await response.json();

        expect(response.status()).toBe(200);
        expect(body).toEqual(payload2);
    });

    test('should update booking with Basic Auth', async ({ request }) => {
        const createResponse = await helpers.createBooking(payload1);
        const createBody: BookingResponse = await createResponse.json();
        const bookingID = createBody.bookingid;

        const response = await request.put(`${helpers.baseURL}/booking/${bookingID}`, {
            data: payload2,
            headers: {
                'Authorization': 'Basic YWRtaW46cGFzc3dvcmQxMjM=',
                'Accept': 'application/json'
            }
        });
        const body: Booking = await response.json();

        expect(response.status()).toBe(200);
        expect(body).toEqual(payload2);
    });

    test('should return 405 for non-existent booking', async () => {
        const response = await helpers.updateBooking(100000, payload2, token);
        expect(response.status()).toBe(405);
    });

    test.skip('should update with XML payload', async () => {
        await helpers.createBooking(payload1);

        const response = await helpers.updateBooking(1, payload2, token, {
            'Content-Type': 'text/xml'
        });
        const body: Booking = await response.json();
        console.log("Response is: \n", body)

        expect(response.status()).toBe(200);
        expect(body).toEqual(payload2);
    });

    test('should return XML response when Accept is application/xml', async () => {
        const createResponse = await helpers.createBooking(payload1);
        const createBody: BookingResponse = await createResponse.json();
        const bookingID = createBody.bookingid;

        const response = await helpers.updateBooking(bookingID, payload2, token, {
            'Accept': 'application/xml'
        });
        const body = await response.text();
        console.log("Response is: \n", body)

        expect(response.status()).toBe(200);
        expect(body).toContain('<?xml');
    });
});
