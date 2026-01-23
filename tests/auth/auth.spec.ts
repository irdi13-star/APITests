// tests/api/auth/auth.spec.ts
import { test, expect } from '../../testSetup/testWithTestrail';
import { AuthAPI } from '../../src/api/auth/AuthAPI';
import testData from '../../src/resources/testData.json'

test.describe('Restful Booker - Authentication', () => {
    let authAPI: AuthAPI;
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    test.beforeEach(async ({ request, logger }) => authAPI = new AuthAPI(request, baseURL));

    test('C45 - Successful Authentication with Valid Credentials', async ({ logger }) => {
        const token = await authAPI.getToken('admin', 'password123');

        expect(token).toBeTruthy();
        expect(token.length).toBeGreaterThan(0);
        logger.log(`Token obtained: ${token.substring(0, 10)}...`);
    });
    
    test('C46 - Authentication Failure with Invalid Credentials', async ({ logger }) => {
        const response = await authAPI.authenticateAndExpectFailure({
            username: 'nimda',
            password: '321drowssap'
        });

        logger.log(`Response: ${JSON.stringify(response, null, 2)}`);
        expect(response.reason).toBe("Bad credentials");
    });

    test('C47 - Authentication Failure with Missing Credentials', async ({ request, logger }) => {
        const response = await request.post(`${baseURL}/auth`, {
            data: {}
        });

        const body = await response.json();

        logger.log(`Status: ${response.status()}`);
        logger.log(`Response body: ${JSON.stringify(body, null, 2)}`);

        if (body.reason !== "Bad credentials") {
            logger.error("Unexpected error message received");
            throw new Error(`Expected "Bad credentials", got "${body.reason}"`);
        }

        expect(body.reason).toBe("Bad credentials");
    });

    test('C48 - Authentication Failure with Empty Credentials', async ({ request, logger }) => {
        const response = await request.post(`${baseURL}/auth`, {
            data: {
                username: '',
                password: ''
            }
        });

        const body = await response.json();

        logger.log(`Status: ${response.status()}`);
        logger.log(`Response body: ${JSON.stringify(body, null, 2)}`);

        if (body.reason !== "Bad credentials") {
            logger.error("Unexpected error message received");
            throw new Error(`Expected "Bad credentials", got "${body.reason}"`);
        }

        expect(body.reason).toBe("Bad credentials");
    });

    test('C49 - Authentication with Special Characters in Credentials', async ({ request, logger }) => {
        const response = await request.post(`${baseURL}/auth`, {
            data: {
                username: '351-.,?',
                password: ',./`=-'
            }
        });

        const body = await response.json();

        logger.log(`Status: ${response.status()}`);
        logger.log(`Response body: ${JSON.stringify(body, null, 2)}`);

        if (body.reason !== "Bad credentials") {
            logger.error("Unexpected error message received");
            throw new Error(`Expected "Bad credentials", got "${body.reason}"`);
        }

        expect(body.reason).toBe("Bad credentials");
    });

    test('C50 - Authentication with Long in Credentials', async ({ request, logger }) => {
        const response = await request.post(`${baseURL}/auth`, {
            data: {
                username: testData.longCharactersWord,
                password: testData.longCharactersWord
            }
        });

        const body = await response.json();

        logger.log(`Status: ${response.status()}`);
        logger.log(`Response body: ${JSON.stringify(body, null, 2)}`);

        if (body.reason !== "Bad credentials") {
            logger.error("Unexpected error message received");
            throw new Error(`Expected "Bad credentials", got "${body.reason}"`);
        }

        expect(body.reason).toBe("Bad credentials");
    });

    test('C99 - Authentication Failure with Invalid Username', async ({ logger }) => {
        const response = await authAPI.authenticateAndExpectFailure({
            username: 'invaliduser',
            password: 'password123'
        });

        logger.log(`Response: ${JSON.stringify(response, null, 2)}`);
        expect(response.reason).toBe("Bad credentials");
    });

    test('C100 - Authentication Failure with Invalid Password', async ({ logger }) => {
        const response = await authAPI.authenticateAndExpectFailure({
            username: 'admin',
            password: 'wrongpassword'
        });

        logger.log(`Response: ${JSON.stringify(response, null, 2)}`);
        expect(response.reason).toBe("Bad credentials");
    });
});