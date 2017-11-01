class RegisterRequest {
    name: string;
    email: string;
    masterPasswordHash: string;
    masterPasswordHint: string;
    key: string;

    constructor(email: string, masterPasswordHash: string, masterPasswordHint: string, key: string) {
        this.name = null;
        this.email = email;
        this.masterPasswordHash = masterPasswordHash;
        this.masterPasswordHint = masterPasswordHint ? masterPasswordHint : null;
        this.key = key;
    }
}

export { RegisterRequest };
(window as any).RegisterRequest = RegisterRequest;
