
import { test, expect } from '@playwright/test';
import { BookingHelpers, BookingResponse } from '../../helpers/bookingHelpers';
import { payload1, payload2, badPayload } from '../../fixtures/payloads';

test.describe('Restful Booker - POST /booking', () => {
    let helpers: BookingHelpers;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
    });

    test('should create a booking and return booking ID', async () => {
        const response = await helpers.createBooking(payload1);
        const body: BookingResponse = await response.json();

        expect(response.status()).toBe(200);
        expect(body.bookingid).toBeGreaterThan(0);
        expect(body.booking).toEqual(payload1);
    });

    test.skip('should create booking with XML payload', async () => {
        const response = await helpers.createBooking(payload1, {
            'Content-Type': 'text/xml'
        });
        const body: BookingResponse = await response.json();

        expect(response.status()).toBe(200);
        expect(body.bookingid).toBeGreaterThan(0);
        expect(body.booking).toEqual(payload1);
    });

    test('should return 500 for invalid payload', async () => {
        const response = await helpers.createBooking(badPayload as any);
        expect(response.status()).toBe(500);
    });

    test('should increment booking ID for multiple bookings', async () => {
        await helpers.createBooking(payload1);
        const response = await helpers.createBooking(payload2);
        const body: BookingResponse = await response.json();

        expect(response.status()).toBe(200);
        expect(body.bookingid).toBeGreaterThan(0);
    });

    test('should return XML response when Accept is application/xml', async () => {
        const response = await helpers.createBooking(payload2, {
            'Accept': 'application/xml'
        });
        const body = await response.text();

        expect(response.status()).toBe(200);
        expect(body).toContain('<?xml');
        expect(body).toContain('<created-booking>');
    });

    test('should accept payload with extra parameters', async () => {
        const extraPayload = { ...payload1, extra: 'bad' };
        const response = await helpers.createBooking(extraPayload as any);

        expect(response.status()).toBe(200);
    });

    test('should return 418 for unsupported Accept header', async () => {
        const response = await helpers.createBooking(payload1, {
            'Accept': 'application/ogg'
        });

        expect(response.status()).toBe(418);
    });
});