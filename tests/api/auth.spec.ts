import { test, expect } from "../../testSetup/testWithTestrail";
import { BookingHelpers, AuthResponse } from '../../helpers/bookingHelpers';
import { allure } from 'allure-playwright';
import { extractCaseId } from "../../helpers/extractCaseId";
import { addResultForCase } from "../../testrail/testrailService";
import testData from '../../resources/testData.json'
import { formatTestrailError } from "../../helpers/formatTestrailError";

test.describe('Restful Booker - POST /auth', () => {
    let helpers: BookingHelpers;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
    });

    test('C45 - Successful Authentication with Valid Credentials', async ({ request }) => {
        await allure.epic('User Management');
        await allure.feature('User Creation');
        await allure.story('As an admin, I want to create new users');
        await allure.severity('critical');
        await allure.owner('Your Name');
        await allure.tag('api');

        const response = await request.post(`${helpers.baseURL}/auth`, {
            data: { username: 'admin', password: 'password123' }
        });
        await allure.step('Verify response body', async () => {
            const body: AuthResponse = await response.json();

            expect(response.status()).toBe(200);
            expect(body).toHaveProperty('token');
            expect(body.token).toMatch(/[a-zA-Z0-9]{15,}/);
        });
    });

    test('C46 - Authentication Failure with Invalid Credentials', async ({ request }) => {
        const response = await request.post(`${helpers.baseURL}/auth`, {
            data: { username: 'nimda', password: '321drowssap' }
        });
        const body: AuthResponse = await response.json();

        await allure.step('Verify errored response body', async () => {
            expect(response.status()).toBe(200);
            if (body.reason !== "Bad credentials") {
                throw new Error(
                    `Expected auth error "Bad credentials" but received "${body.reason}"`
                );
            }
        });
    });

    test('C47 - Authentication Failure with Missing Credentials', async ({ request }) => {
        const response = await request.post(`${helpers.baseURL}/auth`, {
        });
        const body: AuthResponse = await response.json();

        await allure.step('Verify errored response body', async () => {
            expect(response.status()).toBe(200);
            if (body.reason !== "Bad credentials") {
                throw new Error(
                    `Expected auth error "Bad credentials" but received "${body.reason}"`
                );
            }
            console.log('Response body is: ', body.reason)
        });
    });

    test('C48 - Authentication with Empty Credentials', async ({ request }) => {
        const response = await request.post(`${helpers.baseURL}/auth`, {
            data: { username: '', password: '' }
        });
        const body: AuthResponse = await response.json();

        await allure.step('Verify errored response body', async () => {
            expect(response.status()).toBe(200);
            if (body.reason !== "Bad credentials") {
                throw new Error(
                    `Expected auth error "Bad credentials" but received "${body.reason}"`
                );
            }
        });
    });

    test('C49 - Authentication with Special Characters in Credentials', async ({ request }) => {
        const response = await request.post(`${helpers.baseURL}/auth`, {
            data: {
                username: '351-.,?', password: ',./`=-'
            }
        });
        const body: AuthResponse = await response.json();

        await allure.step('Verify errored response body', async () => {
            expect(response.status()).toBe(200);
            if (body.reason !== "Bad credentials") {
                throw new Error(
                    `Expected auth error "Bad credentials" but received "${body.reason}"`
                );
            }
        });
    });

    test('C50 - Authentication with Long in Credentials', async ({ request }) => {
        const response = await request.post(`${helpers.baseURL}/auth`, {
            data: {
                username: testData.longCharactersWord, password: testData.longCharactersWord
            }
        });
        const body: AuthResponse = await response.json();

        await allure.step('Verify errored response body', async () => {
            expect(response.status()).toBe(200);
            if (body.reason !== "Bad credentials") {
                throw new Error(
                    `Expected auth error "Bad credentials" but received "${body.reason}"`
                );
            }
            console.log('Response body is: ', body.reason)
        });
    });
});