class CipherString {
    encryptedString?: string;
    encryptionType?: number; // TODO: enum
    decryptedValue?: string;
    cipherText?: string;
    initializationVector?: string;
    mac?: string;
    cryptoService: any; // TODO: type

    constructor() {
        this.cryptoService = chrome.extension.getBackgroundPage().bg_cryptoService;
        const constants = chrome.extension.getBackgroundPage().bg_constantsService;

        if (arguments.length >= 2) {
            // ct and header
            this.encryptedString = arguments[0] + '.' + arguments[1];

            // iv
            if (arguments.length > 2 && arguments[2]) {
                this.encryptedString += ('|' + arguments[2]);
            }

            // mac
            if (arguments.length > 3 && arguments[3]) {
                this.encryptedString += ('|' + arguments[3]);
            }

            this.encryptionType = arguments[0];
            this.cipherText = arguments[1];
            this.initializationVector = arguments[2] || null;
            this.mac = arguments[3] || null;

            return;
        } else if (arguments.length !== 1) {
            return;
        }

        this.encryptedString = arguments[0];
        if (!this.encryptedString) {
            return;
        }

        const headerPieces = this.encryptedString.split('.');
        let encPieces: string[] = null;

        if (headerPieces.length === 2) {
            try {
                this.encryptionType = parseInt(headerPieces[0], null);
                encPieces = headerPieces[1].split('|');
            } catch (e) {
                return;
            }
        } else {
            encPieces = this.encryptedString.split('|');
            this.encryptionType = encPieces.length === 3 ? constants.encType.AesCbc128_HmacSha256_B64 :
                constants.encType.AesCbc256_B64;
        }

        switch (this.encryptionType) {
            case constants.encType.AesCbc128_HmacSha256_B64:
            case constants.encType.AesCbc256_HmacSha256_B64:
                if (encPieces.length !== 3) {
                    return;
                }

                this.initializationVector = encPieces[0];
                this.cipherText = encPieces[1];
                this.mac = encPieces[2];
                break;
            case constants.encType.AesCbc256_B64:
                if (encPieces.length !== 2) {
                    return;
                }

                this.initializationVector = encPieces[0];
                this.cipherText = encPieces[1];
                break;
            case constants.encType.Rsa2048_OaepSha256_B64:
            case constants.encType.Rsa2048_OaepSha1_B64:
                if (encPieces.length !== 1) {
                    return;
                }

                this.cipherText = encPieces[0];
                break;
            default:
                return;
        }
    }

    decrypt(orgId: string) {
        const self = this;

        if (this.decryptedValue) {
            return new Promise((resolve) => {
                resolve(self.decryptedValue);
            });
        }

        return self.cryptoService.getOrgKey(orgId).then((orgKey: any) => {
            return self.cryptoService.decrypt(self, orgKey);
        }).then((decValue: any) => {
            self.decryptedValue = decValue;
            return self.decryptedValue;
        }).catch(() => {
            self.decryptedValue = '[error: cannot decrypt]';
            return self.decryptedValue;
        });
    }
}

export { CipherString };
(window as any).CipherString = CipherString;
