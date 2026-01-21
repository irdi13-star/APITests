import { test, expect } from "../../testSetup/testWithTestrail";
import { BookingHelpers, BookingResponse } from '../../helpers/bookingHelpers';
import { payload1 } from '../../fixtures/payloads';

test.describe('Restful Booker - DELETE /booking', () => {
    let helpers: BookingHelpers;
    let token: string;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
        token = await helpers.authenticate('admin', 'password123');
    });

    test('C69 - Delete Booking - Unauthorized Access', async ({ request }) => {
        const response = await request.delete(`${helpers.baseURL}/booking/1`);
        expect(response.status()).toBe(403);
    });

    test('C95 - Delete Booking - Wrong authorization credentials', async ({ request }) => {
        const invalidToken = await helpers.authenticate('nmida', '321drowssap');

        const response = await request.delete(`${helpers.baseURL}/booking/1`, {
            headers: { 'Cookie': `token=${invalidToken}` }
        });

        expect(response.status()).toBe(403);
    });

    test('C67 - Delete Booking - Valid Booking ID', async () => {
        const booking = await helpers.createBookingJsonAndValidateIt(payload1);

        const response = await helpers.deleteBooking(booking.bookingid, token);

        expect(response.status()).toBe(201);
    });

    test('C72 - Delete Booking - should delete booking with Basic Auth', async ({ request }) => {
        const booking = await helpers.createBookingJsonAndValidateIt(payload1);

        const response = await request.delete(`${helpers.baseURL}/booking/${booking.bookingid}`, {
            headers: { 'Authorization': 'Basic YWRtaW46cGFzc3dvcmQxMjM=' }
        });

        expect(response.status()).toBe(201);
    });

    test('C68 - Delete Booking - Invalid Booking ID', async () => {
        const response = await helpers.deleteBooking(10000000, token);
        expect(response.status()).toBe(405);
    });

    test('C71 - Delete Booking - ID Format Validation', async () => {
        const response = await helpers.deleteBookingWithString("trtrt", token);

        expect(response.status()).toBe(405);
    });

    test('C70 - Delete Booking - Booking Already Deleted', async () => {
        const booking = await helpers.createBookingJsonAndValidateIt(payload1);

        const firstTry = await helpers.deleteBooking(booking.bookingid, token);
        expect(firstTry.status()).toBe(201);

        const secondTry = await helpers.deleteBooking(booking.bookingid, token);
        expect(secondTry.status()).toBe(405);
    });
});