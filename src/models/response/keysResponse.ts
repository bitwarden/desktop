class KeysResponse {
    privateKey: string;
    publicKey: string;

    constructor(response: any) {
        this.privateKey = response.PrivateKey;
        this.publicKey = response.PublicKey;
    }
}

export { KeysResponse };
(window as any).KeysResponse = KeysResponse;
