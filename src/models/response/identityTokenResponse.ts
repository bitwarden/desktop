class IdentityTokenResponse {
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    tokenType: string;

    privateKey: string;
    key: string;
    twoFactorToken: string;

    constructor(response: any) {
        this.accessToken = response.access_token;
        this.expiresIn = response.expires_in;
        this.refreshToken = response.refresh_token;
        this.tokenType = response.token_type;

        this.privateKey = response.PrivateKey;
        this.key = response.Key;
        this.twoFactorToken = response.TwoFactorToken;
    }
}

export { IdentityTokenResponse };
(window as any).IdentityTokenResponse = IdentityTokenResponse;
