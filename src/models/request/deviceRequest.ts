class DeviceRequest {
    type: number; // TODO: enum
    name: string;
    identifier: string;
    pushToken?: string;

    constructor(appId: string, utilsService: any) { // TODO: utils service type
        this.type = utilsService.getDeviceType();
        this.name = utilsService.getBrowser();
        this.identifier = appId;
        this.pushToken = null;
    }
}

export { DeviceRequest };
(window as any).DeviceRequest = DeviceRequest;
