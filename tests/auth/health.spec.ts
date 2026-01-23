import { test, expect } from '../../testSetup/testWithTestrail';

test.describe('Restful Booker - Health Checks', () => {
    let baseURL: string;

    test.beforeEach(async () => {
        baseURL = process.env.BASE_URL || 'http://localhost:3000';
    });

    test('C97 - should respond to /ping with 201', async ({ request, logger }) => {
        // Act
        logger?.info('Checking health endpoint /ping');
        const response = await request.get(`${baseURL}/ping`);

        // Assert
        const bodyText = await response.text();
        logger?.log(`Response status: ${response.status()}`);
        logger?.log(`Response text: ${bodyText}`);

        expect(response.status()).toBe(201);
        expect(bodyText).toEqual("Created");
        logger?.log('✓ Health check passed');
    });

    test('C98 - should return 404 for non-existent routes', async ({ request, logger }) => {
        // Act
        logger?.warn('Testing non-existent route: /foo/bar');
        const response = await request.get(`${baseURL}/foo/bar`);

        // Assert
        const bodyText = await response.text();
        logger?.log(`Response status: ${response.status()}`);
        logger?.log(`Response text: ${bodyText}`);

        expect(response.status()).toBe(404);
        expect(bodyText).toEqual("Not Found");
        logger?.log('✓ 404 response for non-existent route');
    });
});