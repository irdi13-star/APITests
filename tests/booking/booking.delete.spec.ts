// tests/api/booking/booking.delete.spec.ts
import { test, expect } from '../../testSetup/testWithTestrail';
import { BookingAPI } from '../../src/api/booking/BookingAPI';
import { AuthAPI } from '../../src/api/auth/AuthAPI';
import { payload1 } from '../../src/fixtures/bookingPayloads';

test.describe('Restful Booker - DELETE /booking', () => {
    let bookingAPI: BookingAPI;
    let authAPI: AuthAPI;
    let token: string;
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    test.beforeEach(async ({ request }) => {
        bookingAPI = new BookingAPI(request, baseURL);
        authAPI = new AuthAPI(request, baseURL);
        token = await authAPI.getToken('admin', 'password123');
    });

    test('C69 - Delete Booking - Unauthorized Access', async ({ request, logger }) => {
        const response = await request.delete(`${baseURL}/booking/1`);

        logger.log(`Status: ${response.status()}`);
        expect(response.status()).toBe(403);
    });

    test('C95 - Delete Booking - Wrong authorization credentials', async ({ logger }) => {
        const invalidToken = await authAPI.getToken('nmida', '321drowssap');

        const response = await bookingAPI.deleteBooking(1, invalidToken);

        logger.log(`Status: ${response.status()}`);
        expect(response.status()).toBe(403);
    });

    test('C67 - Delete Booking - Valid Booking ID', async ({ logger }) => {
        // Arrange: Create booking
        const booking = await bookingAPI.createBookingJson(payload1);
        logger.log(`Created booking ID: ${booking.bookingid}`);

        // Act: Delete booking
        const response = await bookingAPI.deleteBooking(booking.bookingid, token);

        // Assert
        logger.log(`Delete status: ${response.status()}`);
        expect(response.status()).toBe(201);
    });

    test('C72 - Delete Booking - should delete booking with Basic Auth', async ({ request, logger }) => {
        // Arrange
        const booking = await bookingAPI.createBookingJson(payload1);
        logger.log(`Created booking ID: ${booking.bookingid}`);

        // Act
        const response = await request.delete(`${baseURL}/booking/${booking.bookingid}`, {
            headers: { 'Authorization': 'Basic YWRtaW46cGFzc3dvcmQxMjM=' }
        });

        // Assert
        logger.log(`Delete status: ${response.status()}`);
        expect(response.status()).toBe(201);
    });

    test('C68 - Delete Booking - Invalid Booking ID', async ({ logger }) => {
        const invalidId = 10000000;

        const response = await bookingAPI.deleteBooking(invalidId, token);

        logger.log(`Status for invalid ID ${invalidId}: ${response.status()}`);
        expect(response.status()).toBe(405);
    });

    test('C71 - Delete Booking - ID Format Validation', async ({ logger }) => {
        const invalidId = "trtrt";

        const response = await bookingAPI.deleteBooking(invalidId, token);

        logger.log(`Status for string ID "${invalidId}": ${response.status()}`);
        expect(response.status()).toBe(405);
    });

    test('C70 - Delete Booking - Booking Already Deleted', async ({ logger }) => {
        const invalidId = "uwdhw";

        const response = await bookingAPI.deleteBooking(invalidId, token);

        try {
            const body = await response.json();
            logger.log(`Response JSON:\n${JSON.stringify(body, null, 2)}`);
        } catch {
            const bodyText = await response.text();
            logger.log(`Response Text: ${bodyText}`);
            expect(bodyText).toEqual("Method Not Allowed");
        }

        expect(response.status()).toBe(405);
    });
});