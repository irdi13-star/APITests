import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { TestLogger } from '../../helpers/logger';

export abstract class BaseAPI {
    protected request: APIRequestContext;
    protected baseURL: string;
    protected logger?: TestLogger;

    constructor(request: APIRequestContext, baseURL?: string, logger?: TestLogger) {
        this.request = request;
        this.baseURL = baseURL || process.env.BASE_URL || 'http://localhost:3000';
        this.logger = logger;
    }

    protected async sendRequest(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        options?: {
            data?: any;
            headers?: Record<string, string>;
            params?: Record<string, string | number>;
            expectedStatus?: number;
        }
    ): Promise<APIResponse> {
        const url = `${this.baseURL}${endpoint}`;

        this.logger?.log(`${method} ${url}`);
        if (options?.data) {
            this.logger?.log(`Request body: ${JSON.stringify(options.data, null, 2)}`);
        }

        const response = await this.request[method.toLowerCase() as Lowercase<typeof method>](url, {
            data: options?.data,
            headers: options?.headers,
            params: options?.params,
        });

        this.logger?.log(`Status: ${response.status()}`);

        if (options?.expectedStatus !== undefined) {
            expect(response.status()).toBe(options.expectedStatus);
        }

        return response;
    }

    protected async get(endpoint: string, options?: any): Promise<APIResponse> {
        return this.sendRequest('GET', endpoint, options);
    }

    protected async post(endpoint: string, options?: any): Promise<APIResponse> {
        return this.sendRequest('POST', endpoint, options);
    }

    protected async put(endpoint: string, options?: any): Promise<APIResponse> {
        return this.sendRequest('PUT', endpoint, options);
    }

    protected async delete(endpoint: string, options?: any): Promise<APIResponse> {
        return this.sendRequest('DELETE', endpoint, options);
    }

    protected async getResponseBody<T>(response: APIResponse): Promise<T> {
        try {
            const body = await response.json();
            this.logger?.log(`Response body: ${JSON.stringify(body, null, 2)}`);
            return body as T;
        } catch {
            const text = await response.text();
            this.logger?.log(`Response text: ${text}`);
            return text as unknown as T;
        }
    }
}