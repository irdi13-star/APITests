import { APIRequestContext, expect } from '@playwright/test';
import { z } from 'zod';
import { XMLParser } from 'fast-xml-parser';

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

    // async createBooking(payload: Booking, acceptHeader: string = 'application/json', options?: {
        
    //     expectedStatus?: number;
    // }): Promise<CreateBookingResponse> {
    //     const response = await this.request.post(`${this.baseURL}/booking`, {
    //         data: payload,
    //         headers: {
    //             'Accept': acceptHeader
    //         }
    //     });

    //     const expectedStatus = options?.expectedStatus ?? 200;
    //     expect(response.status()).toBe(expectedStatus);

    //     const responseBody = await response.json();
    //     console.log('Created booking id is:', responseBody);
     
    //     return responseBody as CreateBookingResponse;
    // }

    async createBooking(
        payload: Booking,
        acceptHeader: string = 'application/json',
        options?: { expectedStatus?: number }
    ): Promise<CreateBookingResponse | string> {
        const response = await this.request.post(`${this.baseURL}/booking`, {
            data: payload,
            headers: { Accept: acceptHeader }
        });

        const expectedStatus = options?.expectedStatus ?? 200;
        expect(response.status()).toBe(expectedStatus);

        let responseBody: any;
        try {
            // încearcă să parsezi JSON
            responseBody = await response.json();
        } catch {
            // fallback la text pentru erori (500, 400 etc.)
            responseBody = await response.text();
        }

        console.log('Created booking response:', responseBody);
        return responseBody;
    }


    async createBookingJsonAndValidateIt(payload: Booking, options?: { expectedStatus?: number }) {
        const response = await this.createBooking(payload, 'application/json', options);
        return response as CreateBookingResponse;
    }

    // async createBookingXml(payload: Booking, options?: { expectedStatus?: number }) {
    //     const response = await this.createBooking(payload, 'application/xml', options);
    //     return response as string;
    // }

    async createBookingXmlAndValidateIt(payload: Booking): Promise<{ bookingid: number; booking: Booking }> {
        const xmlResponse = await this.createBooking(payload, 'application/xml');

        const parser = new XMLParser();
        const parsed = parser.parse(xmlResponse as string);

        const root = parsed['created-booking']; // root element

        return {
            bookingid: Number(root.bookingid),
            booking: {
                firstname: root.booking.firstname,
                lastname: root.booking.lastname,
                totalprice: Number(root.booking.totalprice),
                depositpaid: root.booking.depositpaid,
                additionalneeds: root.booking.additionalneeds,
                bookingdates: {
                    checkin: root.booking.bookingdates.checkin,
                    checkout: root.booking.bookingdates.checkout
                }
            }
        };
}

    async getBooking(id: number, acceptHeader: string = 'application/json') {
        const response = await this.request.get(`${this.baseURL}/booking/${id}`, {
            headers: { 'Accept': acceptHeader }
        });

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        console.log('Booking is:', responseBody);
        return response;
    }

    async getBookingAllAcceptances(
        bookingId: number,
        accept: 'application/json' | 'application/xml'
    ) {
        const response = this.request.get(`${this.baseURL}/booking/${bookingId}`, {
            headers: { Accept: accept }
        });

        const responseBody = await (await response).text();
        console.log('Booking is:\n', responseBody);
        return response;
    }

    async getBookings(queryParams: string = '') {
        const response = await this.request.get(`${this.baseURL}/booking${queryParams}`);
        const responseBody = await response.text();
        console.log('Response is:', responseBody);
        return response;
    }

    async getAllBookings(queryParams: string = '') {
        const response = await this.request.get(`${this.baseURL}/booking${queryParams}`);
        const responseBody = await response.json();
        console.log('Booking is:', responseBody);
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
