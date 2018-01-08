import AppIdService from './appId.service';
import ConstantsService from './constants.service';
import TokenService from './token.service';

import { Abstractions, Request as Req, Response as Res } from '@bitwarden/jslib';

import EnvironmentUrls from '../models/domain/environmentUrls';

export default class ApiService {
    urlsSet: boolean = false;
    baseUrl: string;
    identityBaseUrl: string;
    deviceType: string;
    logoutCallback: Function;

    constructor(private tokenService: TokenService, platformUtilsService: Abstractions.PlatformUtilsService,
        logoutCallback: Function) {
        this.logoutCallback = logoutCallback;
        this.deviceType = platformUtilsService.getDevice().toString();
    }

    setUrls(urls: EnvironmentUrls) {
        this.urlsSet = true;

        if (urls.base != null) {
            this.baseUrl = urls.base + '/api';
            this.identityBaseUrl = urls.base + '/identity';
            return;
        }

        if (urls.api != null && urls.identity != null) {
            this.baseUrl = urls.api;
            this.identityBaseUrl = urls.identity;
            return;
        }

        /* tslint:disable */
        // Desktop
        //this.baseUrl = 'http://localhost:4000';
        //this.identityBaseUrl = 'http://localhost:33656';

        // Desktop HTTPS
        //this.baseUrl = 'https://localhost:44377';
        //this.identityBaseUrl = 'https://localhost:44392';

        // Desktop external
        //this.baseUrl = 'http://192.168.1.3:4000';
        //this.identityBaseUrl = 'http://192.168.1.3:33656';

        // Preview
        //this.baseUrl = 'https://preview-api.bitwarden.com';
        //this.identityBaseUrl = 'https://preview-identity.bitwarden.com';

        // Production
        this.baseUrl = 'https://api.bitwarden.com';
        this.identityBaseUrl = 'https://identity.bitwarden.com';
        /* tslint:enable */
    }

    // Auth APIs

    async postIdentityToken(request: Req.Token): Promise<Res.IdentityToken | any> {
        const response = await fetch(new Request(this.identityBaseUrl + '/connect/token', {
            body: this.qsStringify(request.toIdentityToken()),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Accept': 'application/json',
                'Device-Type': this.deviceType,
            }),
            method: 'POST',
        }));

        let responseJson: any = null;
        const typeHeader = response.headers.get('content-type');
        if (typeHeader != null && typeHeader.indexOf('application/json') > -1) {
            responseJson = await response.json();
        }

        if (responseJson != null) {
            if (response.status === 200) {
                return new Res.IdentityToken(responseJson);
            } else if (response.status === 400 && responseJson.TwoFactorProviders2 &&
                Object.keys(responseJson.TwoFactorProviders2).length) {
                await this.tokenService.clearTwoFactorToken(request.email);
                return responseJson.TwoFactorProviders2;
            }
        }

        return Promise.reject(new Res.Error(responseJson, response.status, true));
    }

    async refreshIdentityToken(): Promise<any> {
        try {
            await this.doRefreshToken();
        } catch (e) {
            return Promise.reject(null);
        }
    }

    // Two Factor APIs

    async postTwoFactorEmail(request: Req.TwoFactorEmail): Promise<any> {
        const response = await fetch(new Request(this.baseUrl + '/two-factor/send-email-login', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.deviceType,
            }),
            method: 'POST',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Account APIs

    async getAccountRevisionDate(): Promise<number> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/accounts/revision-date', {
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Device-Type': this.deviceType,
            }),
        }));

        if (response.status === 200) {
            return (await response.json() as number);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async postPasswordHint(request: Req.PasswordHint): Promise<any> {
        const response = await fetch(new Request(this.baseUrl + '/accounts/password-hint', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.deviceType,
            }),
            method: 'POST',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async postRegister(request: Req.Register): Promise<any> {
        const response = await fetch(new Request(this.baseUrl + '/accounts/register', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.deviceType,
            }),
            method: 'POST',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Folder APIs

    async postFolder(request: Req.Folder): Promise<Res.Folder> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/folders', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.deviceType,
            }),
            method: 'POST',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new Res.Folder(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async putFolder(id: string, request: Req.Folder): Promise<Res.Folder> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/folders/' + id, {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.deviceType,
            }),
            method: 'PUT',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new Res.Folder(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async deleteFolder(id: string): Promise<any> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/folders/' + id, {
            cache: 'no-cache',
            headers: new Headers({
                'Authorization': authHeader,
                'Device-Type': this.deviceType,
            }),
            method: 'DELETE',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Cipher APIs

    async postCipher(request: Req.Cipher): Promise<Res.Cipher> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/ciphers', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.deviceType,
            }),
            method: 'POST',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new Res.Cipher(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async putCipher(id: string, request: Req.Cipher): Promise<Res.Cipher> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/ciphers/' + id, {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.deviceType,
            }),
            method: 'PUT',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new Res.Cipher(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async deleteCipher(id: string): Promise<any> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/ciphers/' + id, {
            cache: 'no-cache',
            headers: new Headers({
                'Authorization': authHeader,
                'Device-Type': this.deviceType,
            }),
            method: 'DELETE',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Attachments APIs

    async postCipherAttachment(id: string, data: FormData): Promise<Res.Cipher> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/ciphers/' + id + '/attachment', {
            body: data,
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Device-Type': this.deviceType,
            }),
            method: 'POST',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new Res.Cipher(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async deleteCipherAttachment(id: string, attachmentId: string): Promise<any> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/ciphers/' + id + '/attachment/' + attachmentId, {
            cache: 'no-cache',
            headers: new Headers({
                'Authorization': authHeader,
                'Device-Type': this.deviceType,
            }),
            method: 'DELETE',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Sync APIs

    async getSync(): Promise<Res.Sync> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/sync', {
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Device-Type': this.deviceType,
            }),
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new Res.Sync(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Helpers

    private async handleError(response: Response, tokenError: boolean): Promise<Res.Error> {
        if ((tokenError && response.status === 400) || response.status === 401 || response.status === 403) {
            this.logoutCallback(true);
            return null;
        }

        let responseJson: any = null;
        const typeHeader = response.headers.get('content-type');
        if (typeHeader != null && typeHeader.indexOf('application/json') > -1) {
            responseJson = await response.json();
        }

        return new Res.Error(responseJson, response.status, tokenError);
    }

    private async handleTokenState(): Promise<string> {
        let accessToken: string;
        if (this.tokenService.tokenNeedsRefresh()) {
            const tokenResponse = await this.doRefreshToken();
            accessToken = tokenResponse.accessToken;
        } else {
            accessToken = await this.tokenService.getToken();
        }

        return 'Bearer ' + accessToken;
    }

    private async doRefreshToken(): Promise<Res.IdentityToken> {
        const refreshToken = await this.tokenService.getRefreshToken();
        if (refreshToken == null || refreshToken === '') {
            throw new Error();
        }

        const response = await fetch(new Request(this.identityBaseUrl + '/connect/token', {
            body: this.qsStringify({
                grant_type: 'refresh_token',
                client_id: 'browser',
                refresh_token: refreshToken,
            }),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Accept': 'application/json',
                'Device-Type': this.deviceType,
            }),
            method: 'POST',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            const tokenResponse = new Res.IdentityToken(responseJson);
            await this.tokenService.setTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
            return tokenResponse;
        } else {
            const error = await this.handleError(response, true);
            return Promise.reject(error);
        }
    }

    private qsStringify(params: any): string {
        return Object.keys(params).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
    }
}
