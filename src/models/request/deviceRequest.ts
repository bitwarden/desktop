import { Abstractions, Enums } from '@bitwarden/jslib';

class DeviceRequest {
    type: Enums.DeviceType;
    name: string;
    identifier: string;
    pushToken?: string;

    constructor(appId: string, platformUtilsService: Abstractions.PlatformUtilsService) {
        this.type = platformUtilsService.getDevice();
        this.name = platformUtilsService.getDeviceString();
        this.identifier = appId;
        this.pushToken = null;
    }
}

export { DeviceRequest };
(window as any).DeviceRequest = DeviceRequest;
