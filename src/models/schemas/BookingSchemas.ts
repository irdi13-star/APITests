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

export const CreateBookingResponseSchema = z.object({
    bookingid: z.number().positive(),
    booking: BookingSchema
});

export const BookingResponseSchema = z.object({
    bookingid: z.number().positive(),
    booking: BookingSchema
});