// src/api/booking/BookingAPI.ts
import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseAPI } from '../base/BaseAPI';
import { BOOKING_ENDPOINTS } from './BookingEndpoints';
import { Booking, CreateBookingResponse } from '../../models/Booking';
import { TestLogger } from '../../helpers/logger';
import { XMLParser } from 'fast-xml-parser';

export class BookingAPI extends BaseAPI {
    constructor(request: APIRequestContext, baseURL?: string, logger?: TestLogger) {
        super(request, baseURL, logger);
    }

    // ========== CREATE ==========
    async createBooking(
        payload: Booking,
        options?: {
            accept?: string;
            expectedStatus?: number;
        }
    ): Promise<APIResponse> {
        const acceptHeader = options?.accept || 'application/json';

        return this.post(BOOKING_ENDPOINTS.BASE, {
            data: payload,
            headers: { Accept: acceptHeader },
            expectedStatus: options?.expectedStatus
        });
    }

    async createBookingJson(payload: Booking, expectedStatus: number = 200): Promise<CreateBookingResponse> {
        const response = await this.createBooking(payload, {
            accept: 'application/json',
            expectedStatus
        });
        return this.getResponseBody<CreateBookingResponse>(response);
    }

    async createBookingXml(payload: Booking): Promise<CreateBookingResponse> {
        const response = await this.createBooking(payload, { accept: 'application/xml' });
        const xmlText = await response.text();

        this.logger?.log(`XML Response:\n${xmlText}`);

        return this.parseXmlBookingResponse(xmlText);
    }

    private parseXmlBookingResponse(xmlText: string): CreateBookingResponse {
        const parser = new XMLParser();
        const parsed = parser.parse(xmlText);
        const root = parsed['created-booking'];

        return {
            bookingid: Number(root.bookingid),
            booking: {
                firstname: root.booking.firstname,
                lastname: root.booking.lastname,
                totalprice: Number(root.booking.totalprice),
                depositpaid: root.booking.depositpaid === 'true',
                additionalneeds: root.booking.additionalneeds,
                bookingdates: {
                    checkin: root.booking.bookingdates.checkin,
                    checkout: root.booking.bookingdates.checkout
                }
            }
        };
    }

    // ========== READ ==========
    async getBooking(
        id: number | string,
        options?: {
            accept?: string;
            expectedStatus?: number;
        }
    ): Promise<APIResponse> {
        const acceptHeader = options?.accept || 'application/json';

        return this.get(BOOKING_ENDPOINTS.BY_ID(id), {
            headers: { Accept: acceptHeader },
            expectedStatus: options?.expectedStatus
        });
    }

    async getBookingJson(id: number, expectedStatus: number = 200): Promise<Booking> {
        const response = await this.getBooking(id, {
            accept: 'application/json',
            expectedStatus
        });
        return this.getResponseBody<Booking>(response);
    }

    async getAllBookings(queryParams?: string): Promise<APIResponse> {
        const endpoint = queryParams ? `${BOOKING_ENDPOINTS.BASE}${queryParams}` : BOOKING_ENDPOINTS.BASE;
        return this.get(endpoint);
    }

    // ========== UPDATE ==========
    async updateBooking(
        id: number,
        payload: Booking,
        token: string,
        options?: {
            headers?: Record<string, string>;
            expectedStatus?: number;
        }
    ): Promise<APIResponse> {
        return this.put(BOOKING_ENDPOINTS.BY_ID(id), {
            data: payload,
            headers: {
                'Accept': 'application/json',
                'Cookie': `token=${token}`,
                ...options?.headers
            },
            expectedStatus: options?.expectedStatus
        });
    }

    async updateBookingJson(
        id: number,
        payload: Booking,
        token: string,
        expectedStatus: number = 200
    ): Promise<Booking> {
        const response = await this.updateBooking(id, payload, token, { expectedStatus });
        return this.getResponseBody<Booking>(response);
    }

    // ========== DELETE ==========
    async deleteBooking(
        id: number | string,
        token: string,
        options?: {
            expectedStatus?: number;
        }
    ): Promise<APIResponse> {
        return this.delete(BOOKING_ENDPOINTS.BY_ID(id), {
            headers: { Cookie: `token=${token}` },
            expectedStatus: options?.expectedStatus
        });
    }
}