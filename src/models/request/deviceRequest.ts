import { DeviceType } from '../../enums/deviceType.enum';
import { BrowserUtilsService } from '../../services/abstractions/browserUtils.service';

class DeviceRequest {
    type: DeviceType;
    name: string;
    identifier: string;
    pushToken?: string;

    constructor(appId: string, browserUtilsService: BrowserUtilsService) {
        this.type = browserUtilsService.getDevice();
        this.name = browserUtilsService.getDeviceString();
        this.identifier = appId;
        this.pushToken = null;
    }
}

export { DeviceRequest };
(window as any).DeviceRequest = DeviceRequest;
