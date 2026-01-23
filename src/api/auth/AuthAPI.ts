// src/api/auth/AuthAPI.ts
import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseAPI } from '../base/BaseAPI';
import { AUTH_ENDPOINTS } from './AuthEndpoints';
import { AuthCredentials, AuthResponse } from '../../models/Auth';
import { TestLogger } from '../../helpers/logger';

export class AuthAPI extends BaseAPI {
    constructor(request: APIRequestContext, baseURL?: string, logger?: TestLogger) {
        super(request, baseURL, logger);
    }

    async authenticate(credentials: AuthCredentials): Promise<APIResponse> {
        return this.post(AUTH_ENDPOINTS.TOKEN, {
            data: credentials
        });
    }

    async getToken(username: string, password: string): Promise<string> {
        const response = await this.authenticate({ username, password });
        const body = await this.getResponseBody<AuthResponse>(response);

        if (body.token) {
            this.logger?.log(`Token obtained successfully`);
        } else {
            this.logger?.error(`Authentication failed: ${body.reason}`);
        }

        return body.token || '';
    }

    async authenticateAndExpectFailure(
        credentials: Partial<AuthCredentials>,
        expectedStatus: number = 200
    ): Promise<AuthResponse> {
        const response = await this.post(AUTH_ENDPOINTS.TOKEN, {
            data: credentials,
            expectedStatus
        });
        return this.getResponseBody<AuthResponse>(response);
    }
}