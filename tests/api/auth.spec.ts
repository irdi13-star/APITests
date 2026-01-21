import { test, expect } from '@playwright/test';
import { BookingHelpers, AuthResponse } from '../../helpers/bookingHelpers';
import { allure } from 'allure-playwright';
import { extractCaseId } from "../../helpers/extractCaseId";
import { addResultForCase } from "../../testrail/testrailService";

test.describe('Restful Booker - POST /auth', () => {
    let helpers: BookingHelpers;

    test.beforeEach(async ({ request }) => {
        helpers = new BookingHelpers(request);
    });

    test.afterEach(async ({ }, testInfo) => {
        const caseId = extractCaseId(testInfo.title);
        if (caseId) {
            await addResultForCase(caseId, testInfo.status === "passed", testInfo.error?.message ?? "");
        }
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
            expect(body.reason).toBe('Bad credentials');
        });
    });
});