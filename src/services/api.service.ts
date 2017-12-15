import AppIdService from './appId.service';
import ConstantsService from './constants.service';
import TokenService from './token.service';
import UtilsService from './utils.service';

import EnvironmentUrls from '../models/domain/environmentUrls';

import { CipherRequest } from '../models/request/cipherRequest';
import { DeviceRequest } from '../models/request/deviceRequest';
import { DeviceTokenRequest } from '../models/request/deviceTokenRequest';
import { FolderRequest } from '../models/request/folderRequest';
import { PasswordHintRequest } from '../models/request/passwordHintRequest';
import { RegisterRequest } from '../models/request/registerRequest';
import { TokenRequest } from '../models/request/tokenRequest';
import { TwoFactorEmailRequest } from '../models/request/twoFactorEmailRequest';

import { AttachmentResponse } from '../models/response/attachmentResponse';
import { CipherResponse } from '../models/response/cipherResponse';
import { DeviceResponse } from '../models/response/deviceResponse';
import { DomainsResponse } from '../models/response/domainsResponse';
import { ErrorResponse } from '../models/response/errorResponse';
import { FolderResponse } from '../models/response/folderResponse';
import { GlobalDomainResponse } from '../models/response/globalDomainResponse';
import { IdentityTokenResponse } from '../models/response/identityTokenResponse';
import { KeysResponse } from '../models/response/keysResponse';
import { ListResponse } from '../models/response/listResponse';
import { ProfileOrganizationResponse } from '../models/response/profileOrganizationResponse';
import { ProfileResponse } from '../models/response/profileResponse';
import { SyncResponse } from '../models/response/syncResponse';

export default class ApiService {
    urlsSet: boolean = false;
    baseUrl: string;
    identityBaseUrl: string;
    logoutCallback: Function;

    constructor(private tokenService: TokenService, private utilsService: UtilsService,
        logoutCallback: Function) {
        this.logoutCallback = logoutCallback;
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

    async postIdentityToken(request: TokenRequest): Promise<IdentityTokenResponse | any> {
        const response = await fetch(new Request(this.identityBaseUrl + '/connect/token', {
            body: this.qsStringify(request.toIdentityToken()),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Accept': 'application/json',
                'Device-Type': this.utilsService.getBrowser().toString(),
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
                return new IdentityTokenResponse(responseJson);
            } else if (response.status === 400 && responseJson.TwoFactorProviders2 &&
                Object.keys(responseJson.TwoFactorProviders2).length) {
                await this.tokenService.clearTwoFactorToken(request.email);
                return responseJson.TwoFactorProviders2;
            }
        }

        return Promise.reject(new ErrorResponse(responseJson, response.status, true));
    }

    async refreshIdentityToken(): Promise<any> {
        try {
            await this.doRefreshToken();
        } catch (e) {
            return Promise.reject(null);
        }
    }

    // Two Factor APIs

    async postTwoFactorEmail(request: TwoFactorEmailRequest): Promise<any> {
        const response = await fetch(new Request(this.baseUrl + '/two-factor/send-email-login', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.utilsService.getBrowser().toString(),
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
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
        }));

        if (response.status === 200) {
            return (await response.json() as number);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async postPasswordHint(request: PasswordHintRequest): Promise<any> {
        const response = await fetch(new Request(this.baseUrl + '/accounts/password-hint', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'POST',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async postRegister(request: RegisterRequest): Promise<any> {
        const response = await fetch(new Request(this.baseUrl + '/accounts/register', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'POST',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Folder APIs

    async postFolder(request: FolderRequest): Promise<FolderResponse> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/folders', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'POST',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new FolderResponse(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async putFolder(id: string, request: FolderRequest): Promise<FolderResponse> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/folders/' + id, {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'PUT',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new FolderResponse(responseJson);
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
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'DELETE',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Cipher APIs

    async postCipher(request: CipherRequest): Promise<CipherResponse> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/ciphers', {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'POST',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new CipherResponse(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    async putCipher(id: string, request: CipherRequest): Promise<CipherResponse> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/ciphers/' + id, {
            body: JSON.stringify(request),
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json; charset=utf-8',
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'PUT',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new CipherResponse(responseJson);
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
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'DELETE',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Attachments APIs

    async postCipherAttachment(id: string, data: FormData): Promise<CipherResponse> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/ciphers/' + id + '/attachment', {
            body: data,
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'POST',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new CipherResponse(responseJson);
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
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'DELETE',
        }));

        if (response.status !== 200) {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Sync APIs

    async getSync(): Promise<SyncResponse> {
        const authHeader = await this.handleTokenState();
        const response = await fetch(new Request(this.baseUrl + '/sync', {
            cache: 'no-cache',
            headers: new Headers({
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            return new SyncResponse(responseJson);
        } else {
            const error = await this.handleError(response, false);
            return Promise.reject(error);
        }
    }

    // Helpers

    private async handleError(response: Response, tokenError: boolean): Promise<ErrorResponse> {
        if ((tokenError && response.status === 400) || response.status === 401 || response.status === 403) {
            this.logoutCallback(true);
            return null;
        }

        let responseJson: any = null;
        const typeHeader = response.headers.get('content-type');
        if (typeHeader != null && typeHeader.indexOf('application/json') > -1) {
            responseJson = await response.json();
        }

        return new ErrorResponse(responseJson, response.status, tokenError);
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

    private async doRefreshToken(): Promise<IdentityTokenResponse> {
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
                'Device-Type': this.utilsService.getBrowser().toString(),
            }),
            method: 'POST',
        }));

        if (response.status === 200) {
            const responseJson = await response.json();
            const tokenResponse = new IdentityTokenResponse(responseJson);
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
