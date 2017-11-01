class DeviceTokenRequest {
    pushToken: string;

    constructor() {
        this.pushToken = null;
    }
}

export { DeviceTokenRequest };
(window as any).DeviceTokenRequest = DeviceTokenRequest;
