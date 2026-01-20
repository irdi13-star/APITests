import { Booking } from '../helpers/bookingHelpers';
import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';

export const payload1: Booking = {
    firstname: 'Sally',
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    additionalneeds: 'Breakfast',
    bookingdates: {
        checkin: '2013-02-01',
        checkout: '2013-02-04'
    }
};

export const payload2: Booking = {
    firstname: 'Geoff',
    lastname: 'White',
    totalprice: 111,
    depositpaid: true,
    additionalneeds: 'Breakfast',
    bookingdates: {
        checkin: '2013-02-02',
        checkout: '2013-02-05'
    }
};

export const payload3: Booking = {
    firstname: 'Bob',
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    additionalneeds: 'Breakfast',
    bookingdates: {
        checkin: '2013-02-03',
        checkout: '2013-02-06'
    }
};

export const dynamicPayload: Booking = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int(1000),
    depositpaid: true,
    additionalneeds: 'Breakfast',
    bookingdates: {
        checkin: DateTime.now().toFormat('yyyy-MM-dd'),
        checkout: DateTime.now().plus({ day: 12}).toFormat('yyyy-MM-dd')
    }
};

export const badPayload = {
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    additionalneeds: 'Breakfast'
};