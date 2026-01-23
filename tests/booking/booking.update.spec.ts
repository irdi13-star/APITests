import { test, expect } from '../../testSetup/testWithTestrail';
import { BookingAPI } from '../../src/api/booking/BookingAPI';
import { AuthAPI } from '../../src/api/auth/AuthAPI';
import { Booking } from '../../src/models/Booking';
import { payload1, payload2 } from '../../src/fixtures/bookingPayloads';

test.describe('Restful Booker - PUT /booking', () => {
    let bookingAPI: BookingAPI;
    let authAPI: AuthAPI;
    let token: string;
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    test.beforeEach(async ({ request, logger }) => {
        bookingAPI = new BookingAPI(request, baseURL, logger);
        authAPI = new AuthAPI(request, baseURL, logger);

        logger?.info('Authenticating admin user');
        token = await authAPI.getToken('admin', 'password123');
        logger?.log(`Token obtained: ${token.substring(0, 10)}...`);
    });

    test('should return 403 without token', async ({ request, logger }) => {
        // Act
        logger?.warn('Attempting update without token');
        const response = await request.put(`${baseURL}/booking/1`, {
            data: payload2
        });

        // Assert
        logger?.log(`Response status: ${response.status()}`);
        expect(response.status()).toBe(403);
        logger?.log('✓ Request correctly rejected without token');
    });

    test('should return 403 with invalid credentials', async ({ request, logger }) => {
        // Arrange
        logger?.warn('Authenticating with invalid credentials');
        const invalidToken = await authAPI.getToken('nmida', '321drowssap');
        await bookingAPI.createBookingJson(payload1);

        // Act
        logger?.warn('Attempting update with invalid token');
        const response = await request.put(`${baseURL}/booking/1`, {
            data: payload2,
            headers: { 'Cookie': `token=${invalidToken}` }
        });

        // Assert
        logger?.log(`Response status: ${response.status()}`);
        expect(response.status()).toBe(403);
        logger?.log('✓ Request correctly rejected with invalid token');
    });

    test('should update booking successfully', async ({ logger }) => {
        // Arrange
        logger?.info('Creating initial booking');
        const createBooking = await bookingAPI.createBookingJson(payload1);
        logger?.log(`Created booking ID: ${createBooking.bookingid}`);

        // Act
        logger?.info('Updating booking');
        const body = await bookingAPI.updateBookingJson(
            createBooking.bookingid,
            payload2,
            token
        );

        // Assert
        logger?.log('Updated booking data:', body);
        expect(body).toEqual(payload2);
        logger?.log('✓ Booking updated successfully');
    });

    test('should update booking with Basic Auth', async ({ request, logger }) => {
        // Arrange
        logger?.info('Creating initial booking');
        const createdBooking = await bookingAPI.createBookingJson(payload1);
        logger?.log(`Created booking ID: ${createdBooking.bookingid}`);

        // Act
        logger?.info('Updating booking with Basic Auth');
        const response = await request.put(`${baseURL}/booking/${createdBooking.bookingid}`, {
            data: payload2,
            headers: {
                'Authorization': 'Basic YWRtaW46cGFzc3dvcmQxMjM=',
                'Accept': 'application/json'
            }
        });

        const body = await response.json();
        logger?.log('Updated booking:', body);

        // Assert
        expect(response.status()).toBe(200);
        expect(body).toEqual(payload2);
        logger?.log('✓ Booking updated successfully with Basic Auth');
    });

    test('should return 405 for non-existent booking', async ({ logger }) => {
        // Arrange
        const nonExistentId = 100000;

        // Act
        logger?.warn(`Attempting to update non-existent booking ID: ${nonExistentId}`);
        const response = await bookingAPI.updateBooking(nonExistentId, payload2, token);

        // Assert
        logger?.log(`Response status: ${response.status()}`);
        expect(response.status()).toBe(405);
        logger?.log('✓ Non-existent booking update correctly rejected');
    });

    test.skip('should update with XML payload', async ({ logger }) => {
        // Arrange
        logger?.info('Creating initial booking');
        await bookingAPI.createBookingJson(payload1);

        // Act
        logger?.info('Updating with XML Content-Type');
        const response = await bookingAPI.updateBooking(1, payload2, token, {
            headers: { 'Content-Type': 'text/xml' }
        });

        const body: Booking = await response.json();
        logger?.log('Response:', body);

        // Assert
        expect(response.status()).toBe(200);
        expect(body).toEqual(payload2);
        logger?.log('✓ Booking updated with XML payload');
    });

    test('should return XML response when Accept is application/xml', async ({ logger }) => {
        // Arrange
        logger?.info('Creating initial booking with XML');
        const createResponse = await bookingAPI.createBookingXml(payload1);
        logger?.log(`Created booking ID: ${createResponse.bookingid}`);

        // Act
        logger?.info('Updating and requesting XML response');
        const response = await bookingAPI.updateBooking(
            createResponse.bookingid,
            payload2,
            token,
            { headers: { 'Accept': 'application/xml' } }
        );

        const body = await response.text();
        logger?.log(`Response:\n${body}`);

        // Assert
        expect(response.status()).toBe(200);
        expect(body).toContain('<?xml');
        logger?.log('✓ XML response received successfully');
    });
});