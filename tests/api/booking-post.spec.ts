
import { test, expect } from '@playwright/test';
import { BookingHelpers, BookingResponse } from '../../helpers/bookingHelpers';
import { payload1, payload2, badPayload } from '../../fixtures/payloads';

test.describe('Restful Booker - POST /booking', () => {
    let helpers: BookingHelpers;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
    });

    test('should create a booking and return booking ID', async () => {
        const response = await helpers.createBookingJsonAndValidateIt(payload1);

        expect(response.bookingid).toBeGreaterThan(0);
        expect(response.booking).toEqual(payload1);
    });

    test('should create booking with XML payload', async () => {
        const response = await helpers.createBookingXmlAndValidateIt(payload1);

        expect(response.bookingid).toBeGreaterThan(0);
        expect(response.booking).toEqual(payload1);
    });

    test('should return 500 for invalid payload', async () => {
        const response = await helpers.createBooking(
            badPayload as any,
            'application/json',
            { expectedStatus: 500 }
        );

        if (typeof response === 'string') {
            expect(response).toContain('Internal Server Error');
        } else {
            expect(response).toHaveProperty('error');
        }
    });

    test('should increment booking ID for multiple bookings', async () => {
        const firstBooking = await helpers.createBookingJsonAndValidateIt(payload1);
        const secondBooking = await helpers.createBookingJsonAndValidateIt(payload2);

        console.log(`First booking id is ${firstBooking.bookingid} and second booking id is ${secondBooking.bookingid}`)
        expect(firstBooking.bookingid).toBeLessThan(secondBooking.bookingid);
    });

    test('should return XML response when Accept is application/xml', async () => {
        await helpers.createBookingXmlAndValidateIt(payload2);
    });

    test('should accept payload with extra parameters', async () => {
        const extraPayload = { ...payload1, extra: 'bad' };
        await helpers.createBooking(extraPayload as any);
    });

    test('should return 418 for unsupported Accept header', async () => {
        await helpers.createBooking(payload1, 'application/oggg', {expectedStatus: 418});
    });
});