import { test, expect } from '../../testSetup/testWithTestrail';
import { BookingAPI } from '../../src/api/booking/BookingAPI';
import { payload1, payload2, badPayload } from '../../src/fixtures/bookingPayloads';

test.describe('Restful Booker - POST /booking', () => {
    let bookingAPI: BookingAPI;
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    test.beforeEach(async ({ request, logger }) => {
        bookingAPI = new BookingAPI(request, baseURL, logger);
    });

    test('should create a booking and return booking ID', async ({ logger }) => {
        // Act
        logger?.info('Creating booking with JSON payload');
        const response = await bookingAPI.createBookingJson(payload1);

        // Assert
        logger?.log(`Created booking ID: ${response.bookingid}`);
        expect(response.bookingid).toBeGreaterThan(0);
        expect(response.booking).toEqual(payload1);
        logger?.log('✓ Booking created successfully with matching data');
    });

    test('should create booking with XML payload', async ({ logger }) => {
        // Act
        logger?.info('Creating booking with XML Accept header');
        const response = await bookingAPI.createBookingXml(payload1);

        // Assert
        logger?.log(`Created booking ID: ${response.bookingid}`);
        expect(response.bookingid).toBeGreaterThan(0);
        expect(response.booking).toEqual(payload1);
        logger?.log('✓ XML booking created and parsed successfully');
    });

    test('should return 500 for invalid payload', async ({ logger }) => {
        // Act
        logger?.warn('Attempting to create booking with invalid payload');
        const response = await bookingAPI.createBooking(badPayload as any, {
            expectedStatus: 500
        });

        // Assert
        try {
            const body = await response.json();
            logger?.log(`Response body:`, body);
            expect(body).toHaveProperty('error');
        } catch {
            const bodyText = await response.text();
            logger?.log(`Response text: ${bodyText}`);
            expect(bodyText).toContain('Internal Server Error');
        }
        logger?.log('✓ Invalid payload correctly rejected');
    });

    test('should increment booking ID for multiple bookings', async ({ logger }) => {
        // Arrange & Act
        logger?.info('Creating first booking');
        const firstBooking = await bookingAPI.createBookingJson(payload1);

        logger?.info('Creating second booking');
        const secondBooking = await bookingAPI.createBookingJson(payload2);

        // Assert
        logger?.log(`First booking ID: ${firstBooking.bookingid}`);
        logger?.log(`Second booking ID: ${secondBooking.bookingid}`);
        expect(firstBooking.bookingid).toBeLessThan(secondBooking.bookingid);
        logger?.log('✓ Booking IDs are incrementing correctly');
    });

    test('should return XML response when Accept is application/xml', async ({ logger }) => {
        // Act
        logger?.info('Creating booking with XML response');
        const response = await bookingAPI.createBookingXml(payload2);

        // Assert
        logger?.log('XML booking response:', response);
        expect(response.bookingid).toBeGreaterThan(0);
        logger?.log('✓ XML response created successfully');
    });

    test('should accept payload with extra parameters', async ({ logger }) => {
        // Arrange
        const extraPayload = { ...payload1, extra: 'bad' };
        logger?.warn(`Testing payload with extra parameters: ${extraPayload}`);

        // Act
        const response = await bookingAPI.createBookingJson(extraPayload as any);

        // Assert
        logger?.log(`Created booking ID: ${response.bookingid}`);
        expect(response.bookingid).toBeGreaterThan(0);
        logger?.log('✓ Extra parameters were ignored, booking created');
    });

    test('should return 418 for unsupported Accept header', async ({ logger }) => {
        // Act
        logger?.warn('Testing unsupported Accept header: application/oggg');
        await bookingAPI.createBooking(payload1, {
            accept: 'application/oggg',
            expectedStatus: 418
        });

        // Assert
        logger?.log('✓ Unsupported Accept header returned 418 as expected');
    });
});