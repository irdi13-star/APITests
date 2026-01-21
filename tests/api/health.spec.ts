import { test, expect } from "../../testSetup/testWithTestrail";

test.describe('Restful Booker - Health Checks', () => {
    let baseURL: string;

    test.beforeEach(async () => {
        baseURL = process.env.BASE_URL || 'http://localhost:3000';
    });

    test('C97 - should respond to /ping with 201', async ({ request, logger }) => {
        const response = await request.get(`${baseURL}/ping`);

        expect(response.status()).toBe(201);
        const bodyText = await response.text();
        logger.log(`Response Text:\n${bodyText}`);
        expect(bodyText).toEqual("Created");
    });

    test('C98 - should return 404 for non-existent routes', async ({ request, logger }) => {
        const response = await request.get(`${baseURL}/foo/bar`);

        expect(response.status()).toBe(404);
        const bodyText = await response.text();
        logger.log(`Response Text:\n${bodyText}`);
        expect(bodyText).toEqual("Not Found");
    });
});