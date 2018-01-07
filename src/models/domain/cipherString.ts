import { Enums } from '@bitwarden/jslib';

import ContainerService from '../../services/container.service';

class CipherString {
    encryptedString?: string;
    encryptionType?: Enums.EncryptionType;
    decryptedValue?: string;
    cipherText?: string;
    initializationVector?: string;
    mac?: string;

    constructor(encryptedStringOrType: string | Enums.EncryptionType, ct?: string, iv?: string, mac?: string) {
        if (ct != null) {
            // ct and header
            const encType = encryptedStringOrType as Enums.EncryptionType;
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
            this.encryptionType = encPieces.length === 3 ? Enums.EncryptionType.AesCbc128_HmacSha256_B64 :
                Enums.EncryptionType.AesCbc256_B64;
        }

        switch (this.encryptionType) {
            case Enums.EncryptionType.AesCbc128_HmacSha256_B64:
            case Enums.EncryptionType.AesCbc256_HmacSha256_B64:
                if (encPieces.length !== 3) {
                    return;
                }

                this.initializationVector = encPieces[0];
                this.cipherText = encPieces[1];
                this.mac = encPieces[2];
                break;
            case Enums.EncryptionType.AesCbc256_B64:
                if (encPieces.length !== 2) {
                    return;
                }

                this.initializationVector = encPieces[0];
                this.cipherText = encPieces[1];
                break;
            case Enums.EncryptionType.Rsa2048_OaepSha256_B64:
            case Enums.EncryptionType.Rsa2048_OaepSha1_B64:
                if (encPieces.length !== 1) {
                    return;
                }

                this.cipherText = encPieces[0];
                break;
            default:
                return;
        }
    }

    decrypt(orgId: string): Promise<string> {
        if (this.decryptedValue) {
            return Promise.resolve(this.decryptedValue);
        }

        if (ContainerService.cryptoService == null) {
            throw new Error('ContainerService.cryptoService not initialized');
        }

        return ContainerService.cryptoService.getOrgKey(orgId).then((orgKey: any) => {
            return ContainerService.cryptoService.decrypt(this, orgKey);
        }).then((decValue: any) => {
            this.decryptedValue = decValue;
            return this.decryptedValue;
        }).catch(() => {
            this.decryptedValue = '[error: cannot decrypt]';
            return this.decryptedValue;
        });
    }
}

export { CipherString };
(window as any).CipherString = CipherString;
