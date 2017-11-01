class TokenRequest {
    email: string;
    masterPasswordHash: string;
    token: string;
    provider: number;
    remember: boolean;
    device?: any;

    constructor(email: string, masterPasswordHash: string, provider: number,
                token: string, remember: boolean, device?: any) {
        this.email = email;
        this.masterPasswordHash = masterPasswordHash;
        this.token = token;
        this.provider = provider;
        this.remember = remember;
        this.device = device ? device : null;
    }

    toIdentityToken() {
        const obj: any = {
            grant_type: 'password',
            username: this.email,
            password: this.masterPasswordHash,
            scope: 'api offline_access',
            client_id: 'browser',
        };

        if (this.device) {
            obj.deviceType = this.device.type;
            obj.deviceIdentifier = this.device.identifier;
            obj.deviceName = this.device.name;
            obj.devicePushToken = this.device.pushToken;
        }

        if (this.token && this.provider !== null && (typeof this.provider !== 'undefined')) {
            obj.twoFactorToken = this.token;
            obj.twoFactorProvider = this.provider;
            obj.twoFactorRemember = this.remember ? '1' : '0';
        }

        return obj;
    }
}

export { TokenRequest };
(window as any).TokenRequest = TokenRequest;
