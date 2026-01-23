import { XMLParser as FastXMLParser } from 'fast-xml-parser';
import { Booking, CreateBookingResponse } from '../models/Booking';

export class XMLParserHelper {
    private parser: FastXMLParser;

    constructor() {
        this.parser = new FastXMLParser({
            ignoreAttributes: false,
            parseTagValue: true,
            parseAttributeValue: true,
            trimValues: true
        });
    }

    /**
     * Parse XML booking response
     */
    parseBookingResponse(xmlText: string): Booking {
        const parsed = this.parser.parse(xmlText);
        const booking = parsed.booking;

        return {
            firstname: booking.firstname,
            lastname: booking.lastname,
            totalprice: Number(booking.totalprice),
            depositpaid: this.parseBoolean(booking.depositpaid),
            additionalneeds: booking.additionalneeds,
            bookingdates: {
                checkin: booking.bookingdates.checkin,
                checkout: booking.bookingdates.checkout
            }
        };
    }

    /**
     * Parse XML create booking response
     */
    parseCreateBookingResponse(xmlText: string): CreateBookingResponse {
        const parsed = this.parser.parse(xmlText);
        const root = parsed['created-booking'];

        return {
            bookingid: Number(root.bookingid),
            booking: {
                firstname: root.booking.firstname,
                lastname: root.booking.lastname,
                totalprice: Number(root.booking.totalprice),
                depositpaid: this.parseBoolean(root.booking.depositpaid),
                additionalneeds: root.booking.additionalneeds,
                bookingdates: {
                    checkin: root.booking.bookingdates.checkin,
                    checkout: root.booking.bookingdates.checkout
                }
            }
        };
    }

    /**
     * Parse boolean from XML
     */
    private parseBoolean(value: any): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    }

    /**
     * Validate XML string
     */
    isValidXML(xmlText: string): boolean {
        try {
            this.parser.parse(xmlText);
            return true;
        } catch {
            return false;
        }
    }
}