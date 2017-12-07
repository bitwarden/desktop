import { EncryptionType } from '../../enums/encryptionType.enum';
import { CryptoService } from '../../services/abstractions/crypto.service';

class CipherString {
    encryptedString?: string;
    encryptionType?: EncryptionType;
    decryptedValue?: string;
    cipherText?: string;
    initializationVector?: string;
    mac?: string;

    private cryptoService: CryptoService;

    constructor(encryptedStringOrType: string | EncryptionType, ct?: string, iv?: string, mac?: string) {
        if (ct != null) {
            // ct and header
            const encType = encryptedStringOrType as EncryptionType;
            this.encryptedString = encType + '.' + ct;

            // iv
            if (iv != null) {
                this.encryptedString += ('|' + iv);
            }

            // mac
            if (mac != null) {
                this.encryptedString += ('|' + mac);
            }

            this.encryptionType = encType;
            this.cipherText = ct;
            this.initializationVector = iv;
            this.mac = mac;

            return;
        }

        this.encryptedString = encryptedStringOrType as string;
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
            this.encryptionType = encPieces.length === 3 ? EncryptionType.AesCbc128_HmacSha256_B64 :
                EncryptionType.AesCbc256_B64;
        }

        switch (this.encryptionType) {
            case EncryptionType.AesCbc128_HmacSha256_B64:
            case EncryptionType.AesCbc256_HmacSha256_B64:
                if (encPieces.length !== 3) {
                    return;
                }

                this.initializationVector = encPieces[0];
                this.cipherText = encPieces[1];
                this.mac = encPieces[2];
                break;
            case EncryptionType.AesCbc256_B64:
                if (encPieces.length !== 2) {
                    return;
                }

                this.initializationVector = encPieces[0];
                this.cipherText = encPieces[1];
                break;
            case EncryptionType.Rsa2048_OaepSha256_B64:
            case EncryptionType.Rsa2048_OaepSha1_B64:
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
        if (this.decryptedValue) {
            return Promise.resolve(this.decryptedValue);
        }

        const self = this;
        if (this.cryptoService == null) {
            this.cryptoService = chrome.extension.getBackgroundPage()
                .bitwardenMain.cryptoService as CryptoService;
        }

        return this.cryptoService.getOrgKey(orgId).then((orgKey: any) => {
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
