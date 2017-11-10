class TwoFactorEmailRequest {
    email: string;
    masterPasswordHash: string;

    constructor(email: string, masterPasswordHash: string) {
        this.email = email;
        this.masterPasswordHash = masterPasswordHash;
    }
}

export { TwoFactorEmailRequest };
(window as any).TwoFactorEmailRequest = TwoFactorEmailRequest;
