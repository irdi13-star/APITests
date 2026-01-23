import { test, expect } from '../../testSetup/testWithTestrail';
import { BookingAPI } from '../../src/api/booking/BookingAPI';
import { BookingValidator } from '../../src/api/booking/BookingValidator';
import { payload1, payload2, payload3, buildDynamicPayload } from '../../src/fixtures/bookingPayloads';
import { CustomAssertions } from '../../src/helpers/assertions';
import { XMLParserHelper } from '../../src/helpers/xmlParser';

test.describe('Restful Booker - GET /booking', () => {
    let bookingAPI: BookingAPI;
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const xmlParser = new XMLParserHelper();

    test.beforeEach(async ({ request }) => {
        bookingAPI = new BookingAPI(request, baseURL);
    });

    test('should return all booking IDs', async ({ logger }) => {
        // Arrange
        logger.info('Creating test bookings');
        await bookingAPI.createBookingJson(payload1);
        await bookingAPI.createBookingJson(payload2);

        // Act
        logger?.info('Fetching all bookings');
        const response = await bookingAPI.getAllBookings();
        const bookings = await response.json();

        // Assert
        logger?.log(`Received ${bookings.length} bookings`);
        expect(response.status()).toBe(200);
        expect(bookings.length).toBeGreaterThan(0);

        CustomAssertions.assertArrayItemsHaveProperty(bookings, 'bookingid');
        logger?.log('✓ All bookings have bookingid property');
    });

    test('should filter bookings by firstname', async ({ logger }) => {
        // Arrange
        logger?.info('Creating test bookings');
        await bookingAPI.createBookingJson(payload1);
        await bookingAPI.createBookingJson(payload2);

        // Act
        logger?.info('Filtering by firstname: Geoff');
        const response = await bookingAPI.getAllBookings('?firstname=Geoff');
        const bookings = await response.json();

        // Assert
        logger?.log(`Found ${bookings.length} booking(s) with firstname=Geoff`);
        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter bookings by lastname', async ({ logger }) => {
        // Arrange
        logger?.info('Creating test bookings');
        await bookingAPI.createBookingJson(payload1);
        await bookingAPI.createBookingJson(payload2);

        // Act
        logger?.info('Filtering by lastname: White');
        const response = await bookingAPI.getAllBookings('?lastname=White');
        const bookings = await response.json();

        // Assert
        logger?.log(`Found ${bookings.length} booking(s) with lastname=White`);
        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter bookings by checkin date', async ({ logger }) => {
        // Arrange
        logger?.info('Creating test bookings');
        await bookingAPI.createBookingJson(payload1);
        await bookingAPI.createBookingJson(payload2);

        // Act
        logger?.info('Filtering by checkin: 2013-02-01');
        const response = await bookingAPI.getAllBookings('?checkin=2013-02-01');
        const bookings = await response.json();

        // Assert
        logger?.log(`Found ${bookings.length} booking(s) with checkin=2013-02-01`);
        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter bookings by checkout date', async ({ logger }) => {
        // Arrange
        logger?.info('Creating test bookings');
        await bookingAPI.createBookingJson(payload1);
        await bookingAPI.createBookingJson(payload2);

        // Act
        logger?.info('Filtering by checkout: 2013-02-05');
        const response = await bookingAPI.getAllBookings('?checkout=2013-02-05');
        const bookings = await response.json();

        // Assert
        logger?.log(`Found ${bookings.length} booking(s) with checkout=2013-02-05`);
        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter by checkin and checkout dates', async ({ logger }) => {
        // Arrange
        logger?.info('Creating dynamic test bookings');
        const booking1 = await bookingAPI.createBookingJson(buildDynamicPayload());
        const booking2 = await bookingAPI.createBookingJson(buildDynamicPayload());
        const booking3 = await bookingAPI.createBookingJson(buildDynamicPayload());

        const createdIds = [booking1.bookingid, booking2.bookingid, booking3.bookingid];
        logger?.log(`Created booking IDs: ${createdIds.join(', ')}`);

        // Act
        logger?.info('Filtering by date range: 2026-01-20 to 2026-02-01');
        const response = await bookingAPI.getAllBookings('?checkin=2026-01-20&checkout=2026-02-01');

        // Assert
        expect(response.status()).toBe(200);
        const bookings = await response.json();
        const returnedIds = bookings.map((b: { bookingid: number }) => b.bookingid);

        logger?.log(`Returned ${returnedIds.length} bookings`);
        for (const id of createdIds) {
            expect(returnedIds).toContain(id);
        }
        logger?.log('✓ All created bookings found in filtered results');
    });

    test('should filter by name and dates', async ({ logger }) => {
        // Arrange
        logger?.info('Creating test bookings');
        await bookingAPI.createBookingJson(payload1);
        await bookingAPI.createBookingJson(payload2);
        await bookingAPI.createBookingJson(payload3);

        // Act
        const queryParams = '?firstname=Geoff&lastname=White&checkin=2013-02-01&checkout=2013-02-06';
        logger?.info(`Filtering with complex query: ${queryParams}`);
        const response = await bookingAPI.getAllBookings(queryParams);
        const bookings = await response.json();

        // Assert
        logger?.log(`Found ${bookings.length} booking(s) matching all criteria`);
        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should return 500 for invalid date format', async ({ logger }) => {
        // Act
        logger?.warn('Testing invalid date format: 2013-02-0');
        const response = await bookingAPI.getAllBookings('?checkout=2013-02-0');

        // Assert
        logger?.log(`Response status: ${response.status()}`);
        expect(response.status()).toBe(500);
        logger?.log('✓ Server correctly rejected invalid date format');
    });

    test('should return XML when Accept header is application/xml', async ({ logger }) => {
        // Arrange
        logger?.info('Creating test booking');
        const createResponse = await bookingAPI.createBookingJson(payload1);
        logger?.log(`Created booking ID: ${createResponse.bookingid}`);

        // Act
        logger?.info('Fetching booking with XML Accept header');
        const response = await bookingAPI.getBooking(createResponse.bookingid, {
            accept: 'application/xml'
        });
        const body = await response.text();

        // Assert
        logger?.log('Validating XML response');
        expect(response.status()).toBe(200);
        expect(body.trim().startsWith('<?xml')).toBeTruthy();

        const parsed = xmlParser.parseBookingResponse(body);
        logger?.log('Parsed XML booking:', parsed);

        expect(parsed.firstname).toBe(payload1.firstname);
        expect(parsed.lastname).toBe(payload1.lastname);
        expect(parsed.totalprice).toBe(payload1.totalprice);
        expect(parsed.depositpaid).toBe(payload1.depositpaid);
        expect(parsed.bookingdates.checkin).toBe(payload1.bookingdates.checkin);
        expect(parsed.bookingdates.checkout).toBe(payload1.bookingdates.checkout);

        logger?.log('✓ XML response correctly parsed and validated');
    });

    test('should return specific booking by ID', async ({ logger }) => {
        // Arrange
        logger?.info('Creating test booking');
        const createResponse = await bookingAPI.createBookingJson(payload1);
        logger?.log(`Created booking ID: ${createResponse.bookingid}`);

        // Act
        logger?.info('Fetching booking by ID');
        const booking = await bookingAPI.getBookingJson(createResponse.bookingid);

        // Assert
        logger?.log('Validating booking data');
        BookingValidator.assertBookingStructure(booking);
        CustomAssertions.assertBookingsMatch(booking, payload1);
        logger?.log('✓ Booking data matches expected payload');
    });

    test('should validate booking structure with Zod schema', async ({ logger }) => {
        // Arrange
        logger?.info('Creating test booking');
        const createResponse = await bookingAPI.createBookingJson(payload1);

        // Act
        logger?.info('Fetching and validating with Zod schema');
        const booking = await bookingAPI.getBookingJson(createResponse.bookingid);

        // Assert
        expect(() => BookingValidator.validateBookingSchema(booking)).not.toThrow();
        const validatedBooking = BookingValidator.validateBookingSchema(booking);

        logger?.log('Validated booking data:', validatedBooking);
        expect(validatedBooking.firstname).toBe(payload1.firstname);
        logger?.log('✓ Zod schema validation passed');
    });

    test('should validate booking structure manually (dynamic testData)', async ({ logger }) => {
        // Arrange
        const payload = buildDynamicPayload();
        logger?.info(`Creating booking with dynamic payload: ${payload}`);
        const createBooking = await bookingAPI.createBookingJson(payload);

        // Act
        logger?.info(`Fetching booking ID: ${createBooking.bookingid}`);
        const booking = await bookingAPI.getBookingJson(createBooking.bookingid);

        // Assert
        logger?.log('Validating booking structure');
        BookingValidator.assertBookingStructure(booking);
        expect(booking).toEqual(payload);
        logger?.log('✓ Dynamic booking data validated successfully');
    });
});