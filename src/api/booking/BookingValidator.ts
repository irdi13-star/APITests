// src/api/booking/BookingValidator.ts
import { expect } from '@playwright/test';
import { Booking, CreateBookingResponse } from '../../models/Booking';
import { BookingSchema, CreateBookingResponseSchema } from '../../models/schemas/BookingSchemas';

export class BookingValidator {
    // Validare cu Zod
    static validateBookingSchema(data: any): Booking {
        return BookingSchema.parse(data);
    }

    static validateCreateBookingResponseSchema(data: any): CreateBookingResponse {
        return CreateBookingResponseSchema.parse(data);
    }

    // Validări Playwright - mai detaliate
    static assertBookingStructure(booking: any): void {
        expect(booking).toHaveProperty('firstname');
        expect(booking).toHaveProperty('lastname');
        expect(booking).toHaveProperty('totalprice');
        expect(booking).toHaveProperty('depositpaid');
        expect(booking).toHaveProperty('bookingdates');
        expect(booking.bookingdates).toHaveProperty('checkin');
        expect(booking.bookingdates).toHaveProperty('checkout');

        // Validate types
        expect(typeof booking.firstname).toBe('string');
        expect(typeof booking.lastname).toBe('string');
        expect(typeof booking.totalprice).toBe('number');
        expect(typeof booking.depositpaid).toBe('boolean');
        expect(typeof booking.bookingdates.checkin).toBe('string');
        expect(typeof booking.bookingdates.checkout).toBe('string');

        // Validate date format
        expect(booking.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(booking.bookingdates.checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        if (booking.additionalneeds !== undefined) {
            expect(typeof booking.additionalneeds).toBe('string');
        }
    }

    static assertCreateBookingResponse(response: any): void {
        expect(response).toHaveProperty('bookingid');
        expect(typeof response.bookingid).toBe('number');
        expect(response.bookingid).toBeGreaterThan(0);
        expect(response).toHaveProperty('booking');

        this.assertBookingStructure(response.booking);
    }

    static assertBookingMatches(actual: Booking, expected: Partial<Booking>): void {
        if (expected.firstname) expect(actual.firstname).toBe(expected.firstname);
        if (expected.lastname) expect(actual.lastname).toBe(expected.lastname);
        if (expected.totalprice) expect(actual.totalprice).toBe(expected.totalprice);
        if (expected.depositpaid !== undefined) expect(actual.depositpaid).toBe(expected.depositpaid);
        if (expected.additionalneeds) expect(actual.additionalneeds).toBe(expected.additionalneeds);
        if (expected.bookingdates) {
            expect(actual.bookingdates.checkin).toBe(expected.bookingdates.checkin);
            expect(actual.bookingdates.checkout).toBe(expected.bookingdates.checkout);
        }
    }
}