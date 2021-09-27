import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { DeviceType } from 'jslib/enums/deviceType';
import { Utils } from 'jslib/misc/utils';
import { EnvironmentUrls } from 'jslib/models/domain/environmentUrls';
import { CollectionDetailsResponse } from 'jslib/models/response/collectionResponse';
import { ErrorResponse } from 'jslib/models/response/errorResponse';
import { ListResponse } from 'jslib/models/response/listResponse';
import { ApiService as ApiServiceBase } from 'jslib/services/api.service';

export class ApiService extends ApiServiceBase {
    private localDevice: DeviceType;
    private localDeviceType: string;
    private localIsWebClient = false;
    private localUsingBaseUrl = false;

    constructor(
        tokenService: TokenService,
        platformUtilsService: PlatformUtilsService,
        private localLogoutCallback: (expired: boolean) => Promise<void>,
        private localCustomUserAgent: string = null
    ) {
        super(
            tokenService,
            platformUtilsService,
            localLogoutCallback,
            localCustomUserAgent);

        this.localDevice = platformUtilsService.getDevice();
        this.localDeviceType = this.localDevice.toString();

        this.localIsWebClient = this.localDevice === DeviceType.IEBrowser || this.localDevice === DeviceType.ChromeBrowser ||
            this.localDevice === DeviceType.EdgeBrowser || this.localDevice === DeviceType.FirefoxBrowser ||
            this.localDevice === DeviceType.OperaBrowser || this.localDevice === DeviceType.SafariBrowser ||
            this.localDevice === DeviceType.UnknownBrowser || this.localDevice === DeviceType.VivaldiBrowser;
    }

    setUrls(urls: EnvironmentUrls): void {
        super.setUrls(urls);

        if (urls.base != null) {
            this.localUsingBaseUrl = true;
        }
    }

    async getCollections(organizationId: string): Promise<ListResponse<CollectionDetailsResponse>> {
        const r = await this.localSend('GET', '/organizations/' + organizationId + '/collections', null, true, true);
        return new ListResponse(r, CollectionDetailsResponse);
    }

    private async localSend(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        path: string,
        body: any,
        authed: boolean,
        hasResponse: boolean,
        apiUrl?: string
    ): Promise<any> {
        apiUrl = Utils.isNullOrWhitespace(apiUrl) ? this.apiBaseUrl : apiUrl;
        const headers = new Headers({
            'Device-Type': this.localDeviceType,
        });
        if (this.localCustomUserAgent != null) {
            headers.set('User-Agent', this.localCustomUserAgent);
        }

        const requestInit: RequestInit = {
            cache: 'no-store',
            credentials: this.localGetCredentials(),
            method: method,
        };

        if (authed) {
            const authHeader = await this.getActiveBearerToken();
            headers.set('Authorization', 'Bearer ' + authHeader);
        }
        if (body != null) {
            if (typeof body === 'string') {
                requestInit.body = body;
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
            } else if (typeof body === 'object') {
                if (body instanceof FormData) {
                    requestInit.body = body;
                } else {
                    headers.set('Content-Type', 'application/json; charset=utf-8');
                    requestInit.body = JSON.stringify(body);
                }
            }
        }
        if (hasResponse) {
            headers.set('Accept', 'application/json');
        }

        requestInit.headers = headers;
        const response = await this.fetch(new Request(apiUrl + path, requestInit));

        if (hasResponse && response.status === 200) {
            const responseJson = await response.json();
            return responseJson;
        } else if (response.status !== 200) {
            const error = await this.localHandleError(response, false, authed);
            return Promise.reject(error);
        }
    }

    private localGetCredentials(): RequestCredentials {
        if (!this.localIsWebClient || this.localUsingBaseUrl) {
            return 'include';
        }
        return undefined;
    }

    private async localHandleError(response: Response, tokenError: boolean, authed: boolean): Promise<ErrorResponse> {
        if (authed && ((tokenError && response.status === 400) || response.status === 401 || response.status === 403)) {
            await this.localLogoutCallback(true);
            return null;
        }

        let responseJson: any = null;
        if (this.localIsJsonResponse(response)) {
            responseJson = await response.json();
        } else if (this.localIsTextResponse(response)) {
            responseJson = { Message: await response.text() };
        }

        return new ErrorResponse(responseJson, response.status, tokenError);
    }

    private localIsJsonResponse(response: Response): boolean {
        const typeHeader = response.headers.get('content-type');
        return typeHeader != null && typeHeader.indexOf('application/json') > -1;
    }

    private localIsTextResponse(response: Response): boolean {
        const typeHeader = response.headers.get('content-type');
        return typeHeader != null && typeHeader.indexOf('text') > -1;
    }
}
