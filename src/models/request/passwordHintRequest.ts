class PasswordHintRequest {
    email: string;

    constructor(email: string) {
        this.email = email;
    }
}

export { PasswordHintRequest };
(window as any).PasswordHintRequest = PasswordHintRequest;
