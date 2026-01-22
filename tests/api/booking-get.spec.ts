import { test, expect } from "../../testSetup/testWithTestrail";
import { BookingHelpers, CreateBookingResponse } from '../../helpers/bookingHelpers';
import { payload1, payload2, payload3, buildDynamicPayload } from '../../fixtures/payloads';
import { XMLParser } from 'fast-xml-parser';

test.describe('Restful Booker - GET /booking', () => {
    let helpers: BookingHelpers;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
    });

    test('should return all booking IDs', async () => {
        await helpers.createBookingJsonAndValidateIt(payload1);
        await helpers.createBookingJsonAndValidateIt(payload2);

        const response = await helpers.getAllBookings();
        const bookings = await response.json();

        console.log(bookings)

        expect(response.status()).toBe(200);
        expect(bookings.length).toBeGreaterThan(0);
        expect(bookings[0]).toHaveProperty('bookingid');
        expect(bookings[1]).toHaveProperty('bookingid');
    });

    test('should filter bookings by firstname', async () => {
        await helpers.createBookingJsonAndValidateIt(payload1);
        await helpers.createBookingJsonAndValidateIt(payload2);

        const response = await helpers.getAllBookings('?firstname=Geoff');
        const bookings = await response.json();

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
        console.log(bookings)
    });

    test('should filter bookings by lastname', async () => {
        await helpers.createBookingJsonAndValidateIt(payload1);
        await helpers.createBookingJsonAndValidateIt(payload2);

        const response = await helpers.getAllBookings('?lastname=White');
        const bookings = await response.json();

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter bookings by checkin date', async () => {
        await helpers.createBookingJsonAndValidateIt(payload1);
        await helpers.createBookingJsonAndValidateIt(payload2);

        const response = await helpers.getAllBookings('?checkin=2013-02-01');
        const bookings = await response.json();

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should filter bookings by checkout date', async () => {
        await helpers.createBookingJsonAndValidateIt(payload1);
        await helpers.createBookingJsonAndValidateIt(payload2);

        const response = await helpers.getAllBookings('?checkout=2013-02-05');
        const bookings = await response.json();

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    // test('should filter by checkin and checkout dates', async () => {
    //     await helpers.createBooking(payload1);
    //     await helpers.createBooking(payload2);
    //     await helpers.createBooking(payload3);

    //     const response = await helpers.getAllBookings('?checkin=2013-02-01&checkout=2013-02-06');
    //     const bookings = await response.json();
    //     console.log('RESPONSE BODY lenght is:\n', JSON.stringify(bookings.length, null, 2));

    //     expect(response.status()).toBe(200);
    //     expect(bookings.length).toBe(2);
    // });

    test('should filter by checkin and checkout dates', async () => {
        const booking1 = await helpers.createBookingJsonAndValidateIt(buildDynamicPayload());
        const booking2 = await helpers.createBookingJsonAndValidateIt(buildDynamicPayload());
        const booking3 = await helpers.createBookingJsonAndValidateIt(buildDynamicPayload());

        const createdIds = [
            booking1.bookingid,
            booking2.bookingid,
            booking3.bookingid
        ];

        const response = await helpers.getAllBookings(
            '?checkin=2026-01-20&checkout=2026-02-01'
        );

        expect(response.status()).toBe(200);

        const bookings = await response.json();
        const returnedIds = bookings.map((b: { bookingid: number }) => b.bookingid);

        for (const id of createdIds) {
            expect(returnedIds).toContain(id);
        }
    });

    test('should filter by name and dates', async () => {
        await helpers.createBookingJsonAndValidateIt(payload1);
        await helpers.createBookingJsonAndValidateIt(payload2);
        await helpers.createBookingJsonAndValidateIt(payload3);

        const response = await helpers.getAllBookings(
            '?firstname=Geoff&lastname=White&checkin=2013-02-01&checkout=2013-02-06'
        );
        const bookings = await response.json();
        // console.log('RESPONSE BODY:\n', JSON.stringify(bookings, null, 2));

        expect(response.status()).toBe(200);
        expect(bookings[0].bookingid).toBeGreaterThan(0);
    });

    test('should return 500 for invalid date format', async () => {
        const response = await helpers.getBookings('?checkout=2013-02-0');
        expect(response.status()).toBe(500);
    });

    test('should return XML when Accept header is application/xml', async () => {
        const createResponse = await helpers.createBookingJsonAndValidateIt(payload1);

        const response = await helpers.getBookingAllAcceptances(createResponse.bookingid, 'application/xml');
        const body = await response.text();

        expect(response.status()).toBe(200);
        expect(body.trim().startsWith('<?xml')).toBeTruthy();

        const parser = new XMLParser();
        const parsed = parser.parse(body);

        expect(parsed).toHaveProperty('booking');
        expect(parsed.booking.firstname).toBe(payload1.firstname);
        expect(parsed.booking.lastname).toBe(payload1.lastname);
        expect(parsed.booking.totalprice).toBe(payload1.totalprice);
        expect(parsed.booking.depositpaid).toBe(payload1.depositpaid);
        expect(parsed.booking.bookingdates.checkin).toBe(payload1.bookingdates.checkin);
        expect(parsed.booking.bookingdates.checkout).toBe(payload1.bookingdates.checkout);
    });

    test('should return specific booking by ID (second)', async () => {
        const createResponse = await helpers.createBooking(payload1) as CreateBookingResponse;

        await helpers.verifyBookingById(createResponse.bookingid, payload1);
    });

    test('should validate booking structure with Zod schema', async () => {
        const createResponse = await helpers.createBooking(payload1) as CreateBookingResponse;

        const response = await helpers.getBooking(createResponse.bookingid);
        const booking = await response.json();

        expect(response.status()).toBe(200);

        expect(() => helpers.validateBookingSchema(booking)).not.toThrow();
        const validatedBooking = helpers.validateBookingSchema(booking);
        expect(validatedBooking.firstname).toBe(payload1.firstname);
    });

    test('should validate booking structure manually (dynamic testData)', async () => {
        const payload = buildDynamicPayload();
        const createBooking = await helpers.createBookingJsonAndValidateIt(payload);

        const response = await helpers.getBooking(createBooking.bookingid);
        const booking = await response.json();

        helpers.assertBookingStructure(booking);
        expect(booking).toEqual(payload);
    });
    
    // test('should validate booking structure (dynamic testData)', async () => {
    //     const details = buildDynamicPayload();
    //     const createBooking = await helpers.createBookingJsonAndValidateIt(details);

    //     helpers.verifyBookingById(createBooking.bookingid);
    // });
});