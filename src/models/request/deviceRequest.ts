import { BrowserType } from '../../enums/browserType.enum';
import { BrowserUtilsService } from '../../services/abstractions/browserUtils.service';

class DeviceRequest {
    type: BrowserType;
    name: string;
    identifier: string;
    pushToken?: string;

    constructor(appId: string, browserUtilsService: BrowserUtilsService) {
        this.type = browserUtilsService.getBrowser();
        this.name = browserUtilsService.getBrowserString();
        this.identifier = appId;
        this.pushToken = null;
    }
}

export { DeviceRequest };
(window as any).DeviceRequest = DeviceRequest;
