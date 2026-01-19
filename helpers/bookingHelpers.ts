import { APIRequestContext, expect } from '@playwright/test';
import { z } from 'zod';

export const BookingDatesSchema = z.object({
    checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
});

export const BookingSchema = z.object({
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    totalprice: z.number().positive(),
    depositpaid: z.boolean(),
    bookingdates: BookingDatesSchema,
    additionalneeds: z.string().optional()
});

export const BookingResponseSchema = z.object({
    bookingid: z.number().positive(),
    booking: BookingSchema
});

export const AuthResponseSchema = z.object({
    token: z.string().optional(),
    reason: z.string().optional()
});
export interface BookingDates {
    checkin: string;
    checkout: string;
}

export interface Booking {
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: BookingDates;
    additionalneeds?: string;
}

export interface CreateBookingResponse {
    bookingid: number;
    booking: Booking;
}

export interface BookingResponse {
    bookingid: number;
    booking: Booking;
}

export interface AuthResponse {
    token?: string;
    reason?: string;
}

export class BookingHelpers {
    private request: APIRequestContext;
    public baseURL: string;

    constructor(request: APIRequestContext) {
        this.request = request;
        this.baseURL = process.env.BASE_URL || 'http://localhost:3000';
    }

    generatePayload(
        firstname: string,
        lastname: string,
        totalprice: number,
        depositpaid: boolean,
        checkin: string,
        checkout: string,
        additionalneeds?: string
    ): Booking {
        const payload: Booking = {
            firstname,
            lastname,
            totalprice,
            depositpaid,
            bookingdates: {
                checkin,
                checkout
            }
        };

        if (additionalneeds !== undefined) {
            payload.additionalneeds = additionalneeds;
        }

        return payload;
    }

    async createBooking(payload: Booking, headers: Record<string, string> = {}) {
        const response = await this.request.post(`${this.baseURL}/booking`, {
            data: payload,
            headers: {
                'Accept': 'application/json',
                ...headers
            }
        });
        return response;
    }

    async getBooking(id: number, acceptHeader: string = 'application/json') {
        const response = await this.request.get(`${this.baseURL}/booking/${id}`, {
            headers: { 'Accept': acceptHeader }
        });
        return response;
    }

    async getBookingSecond(
        bookingId: number,
        accept: 'application/json' | 'application/xml'
    ) {
        return this.request.get(`${this.baseURL}/booking/${bookingId}`, {
            headers: { Accept: accept }
        });
    }

    async getAllBookings(queryParams: string = '') {
        const response = await this.request.get(`${this.baseURL}/booking${queryParams}`);
        return response;
    }

    async updateBooking(
        id: number,
        payload: Booking,
        token: string,
        headers: Record<string, string> = {}
    ) {
        const response = await this.request.put(`${this.baseURL}/booking/${id}`, {
            data: payload,
            headers: {
                'Accept': 'application/json',
                'Cookie': `token=${token}`,
                ...headers
            }
        });
        return response;
    }

    async deleteBooking(id: number, token: string) {
        const response = await this.request.delete(`${this.baseURL}/booking/${id}`, {
            headers: {
                'Cookie': `token=${token}`
            }
        });
        return response;
    }

    async authenticate(username: string, password: string): Promise<string> {
        const response = await this.request.post(`${this.baseURL}/auth`, {
            data: { username, password }
        });
        const body: AuthResponse = await response.json();
        return body.token || '';
    }
    // ZOD schema validation
    validateBookingSchema(data: any): Booking {
        return BookingSchema.parse(data);
    }

    validateBookingResponseSchema(data: any): BookingResponse {
        return BookingResponseSchema.parse(data);
    }

    // Custom validation - Playwright expect
    assertBookingStructure(booking: any) {
        expect(booking).toHaveProperty('firstname');
        expect(booking).toHaveProperty('lastname');
        expect(booking).toHaveProperty('totalprice');
        expect(booking).toHaveProperty('depositpaid');
        expect(booking).toHaveProperty('bookingdates');
        expect(booking.bookingdates).toHaveProperty('checkin');
        expect(booking.bookingdates).toHaveProperty('checkout');

        // Validare tipuri
        expect(typeof booking.firstname).toBe('string');
        expect(typeof booking.lastname).toBe('string');
        expect(typeof booking.totalprice).toBe('number');
        expect(typeof booking.depositpaid).toBe('boolean');
        expect(typeof booking.bookingdates.checkin).toBe('string');
        expect(typeof booking.bookingdates.checkout).toBe('string');

        // Validare format date
        expect(booking.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(booking.bookingdates.checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        if (booking.additionalneeds !== undefined) {
            expect(typeof booking.additionalneeds).toBe('string');
        }
    }

    assertBookingResponseStructure(response: any) {
        expect(response).toHaveProperty('bookingid');
        expect(typeof response.bookingid).toBe('number');
        expect(response.bookingid).toBeGreaterThan(0);

        expect(response).toHaveProperty('booking');
        this.assertBookingStructure(response.booking);
    }

    // Combined validation
    async verifyBookingById(id: number, expectedData?: Partial<Booking>) {
        const response = await this.getBooking(id);
        const booking = await response.json();

        expect(response.status()).toBe(200);

        // Correct structure
        this.assertBookingStructure(booking);

        // Validate Zod schema (optional)
        try {
            this.validateBookingSchema(booking);
        } catch (error) {
            console.error('Schema validation failed:', error);
            throw error;
        }

        // Validate values
        if (expectedData) {
            if (expectedData.firstname) expect(booking.firstname).toBe(expectedData.firstname);
            if (expectedData.lastname) expect(booking.lastname).toBe(expectedData.lastname);
            if (expectedData.totalprice) expect(booking.totalprice).toBe(expectedData.totalprice);
            if (expectedData.depositpaid !== undefined) expect(booking.depositpaid).toBe(expectedData.depositpaid);
            if (expectedData.additionalneeds) expect(booking.additionalneeds).toBe(expectedData.additionalneeds);
            if (expectedData.bookingdates) {
                expect(booking.bookingdates.checkin).toBe(expectedData.bookingdates.checkin);
                expect(booking.bookingdates.checkout).toBe(expectedData.bookingdates.checkout);
            }
        }

        return booking;
    }
}
