import { DeviceType } from '../../enums/deviceType.enum';
import { PlatformUtilsService } from '../../services/abstractions/platformUtils.service';

class DeviceRequest {
    type: DeviceType;
    name: string;
    identifier: string;
    pushToken?: string;

    constructor(appId: string, platformUtilsService: PlatformUtilsService) {
        this.type = platformUtilsService.getDevice();
        this.name = platformUtilsService.getDeviceString();
        this.identifier = appId;
        this.pushToken = null;
    }
}

export { DeviceRequest };
(window as any).DeviceRequest = DeviceRequest;
