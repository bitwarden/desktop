import { BrowserType } from '../../enums/browserType.enum';
import { UtilsService } from '../../services/abstractions/utils.service';

class DeviceRequest {
    type: BrowserType;
    name: string;
    identifier: string;
    pushToken?: string;

    constructor(appId: string, utilsService: UtilsService) {
        this.type = utilsService.getBrowser();
        this.name = utilsService.getBrowserString();
        this.identifier = appId;
        this.pushToken = null;
    }
}

export { DeviceRequest };
(window as any).DeviceRequest = DeviceRequest;
