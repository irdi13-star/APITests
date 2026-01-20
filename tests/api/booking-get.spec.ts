import { test, expect } from '@playwright/test';
import { BookingHelpers, BookingResponse } from '../../helpers/bookingHelpers';
import { dynamicPayload, payload1, payload2, payload3 } from '../../fixtures/payloads';

test.describe('Restful Booker - GET /booking', () => {
    let helpers: BookingHelpers;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
    });

    test('should return all booking IDs', async () => {
        await helpers.createBooking(payload1);
        await helpers.createBooking(payload2);

        const response = await helpers.getAllBookings();
        const bookings = await response.json();

        console.log(bookings)

        expect(response.status()).toBe(200);
        expect(bookings.length).toBeGreaterThan(0);
        expect(bookings[0]).toHaveProperty('bookingid');
        expect(bookings[1]).toHaveProperty('bookingid');
    });

    test('should filter bookings by firstname', async () => {
        await helpers.createBooking(payload1);
        await helpers.createBooking(payload2);

        const response = await helpers.getAllBookings('?firstname=Geoff');
        const bookings = await response.json();

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
        console.log(bookings)
        //{ bookingid: 287 }, { bookingid: 147 }, { bookingid: 493 } 
    });

    test('should filter bookings by lastname', async () => {
        await helpers.createBooking(payload1);
        await helpers.createBooking(payload2);

        const response = await helpers.getAllBookings('?lastname=White');
        const bookings = await response.json();

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter bookings by checkin date', async () => {
        await helpers.createBooking(payload1);
        await helpers.createBooking(payload2);

        const response = await helpers.getAllBookings('?checkin=2013-02-01');
        const bookings = await response.json();

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter bookings by checkout date', async () => {
        await helpers.createBooking(payload1);
        await helpers.createBooking(payload2);

        const response = await helpers.getAllBookings('?checkout=2013-02-05');
        const bookings = await response.json();

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter by checkin and checkout dates', async () => {
        await helpers.createBooking(payload1);
        await helpers.createBooking(payload2);
        await helpers.createBooking(payload3);

        const response = await helpers.getAllBookings('?checkin=2013-02-01&checkout=2013-02-06');
        const bookings = await response.json();
        console.log('RESPONSE BODY lenght is:\n', JSON.stringify(bookings.length, null, 2));
        // console.log('RESPONSE BODY:\n', JSON.stringify(bookings, null, 2));

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter by name and dates', async () => {
        await helpers.createBooking(payload1);
        await helpers.createBooking(payload2);
        await helpers.createBooking(payload3);

        const response = await helpers.getAllBookings(
            '?firstname=Geoff&lastname=White&checkin=2013-02-01&checkout=2013-02-06'
        );
        const bookings = await response.json();
        console.log('RESPONSE BODY:\n', JSON.stringify(bookings, null, 2));

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should return 500 for invalid date format', async () => {
        const response = await helpers.getAllBookings('?checkout=2013-02-0');
        expect(response.status()).toBe(500);
    });

    test('should return XML when Accept header is application/xml', async () => {
        const createResponse = await helpers.createBooking(payload1);
        const createBody: BookingResponse = await createResponse.json();
        const bookingID = createBody.bookingid;

        console.log("Created booking id is:", bookingID);

        const response = await helpers.getBooking(bookingID, 'application/xml');
        const body = await response.text();

        expect(response.status()).toBe(200);
        expect(body).toContain('<?xml');
        expect(body).toContain('<booking>');
    });

    test('should return specific booking by ID (second)', async () => {
        const createResponse = await helpers.createBooking(payload1);
        const createBody: BookingResponse = await createResponse.json();
        const bookingID = createBody.bookingid;

        console.log("Created booking id is:", bookingID);

        const booking = await helpers.verifyBookingById(bookingID, payload1);
        console.log('RESPONSE BODY:\n', JSON.stringify(booking, null, 2));
    });

    test('should validate booking structure with Zod schema', async () => {
        const createResponse = await helpers.createBooking(payload1);
        const createBody: BookingResponse = await createResponse.json();
        const bookingID = createBody.bookingid;

        console.log("Created booking ID is:", bookingID);

        const response = await helpers.getBooking(bookingID);
        const booking = await response.json();

        expect(response.status()).toBe(200);

        expect(() => helpers.validateBookingSchema(booking)).not.toThrow();
        const validatedBooking = helpers.validateBookingSchema(booking);
        expect(validatedBooking.firstname).toBe(payload1.firstname);
    });

    test('should validate booking structure manually (dynamic testData)', async () => {
        const createResponse = await helpers.createBooking(dynamicPayload);
        const createBody: BookingResponse = await createResponse.json();
        const bookingID = createBody.bookingid;
        console.log("Created booking id is:", bookingID);

        const response = await helpers.getBooking(bookingID);
        const booking = await response.json();
        console.log('RESPONSE BODY:\n', JSON.stringify(booking, null, 2));

        expect(response.status()).toBe(200);
        helpers.assertBookingStructure(booking);
        expect(booking).toEqual(dynamicPayload);
    });
});