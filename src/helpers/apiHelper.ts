// src/helpers/apiHelper.ts
import { APIResponse, expect } from '@playwright/test';

export class APIHelper {
    static async verifyStatusCode(response: APIResponse, expected: number): Promise<void> {
        expect(response.status()).toBe(expected);
    }

    static async verifyContentType(response: APIResponse, expected: string): Promise<void> {
        const headers = response.headers();
        expect(headers['content-type']).toContain(expected);
    }

    static async getJsonBody<T>(response: APIResponse): Promise<T> {
        return await response.json() as T;
    }

    static async getTextBody(response: APIResponse): Promise<string> {
        return await response.text();
    }

    static async tryGetBody<T>(response: APIResponse): Promise<T | string> {
        try {
            return await response.json() as T;
        } catch {
            return await response.text();
        }
    }
}