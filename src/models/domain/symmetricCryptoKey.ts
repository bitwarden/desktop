import * as forge from 'node-forge';

import { EncryptionType } from '../../enums/encryptionType.enum';

import SymmetricCryptoKeyBuffers from './symmetricCryptoKeyBuffers';

import UtilsService from '../../services/utils.service';

export default class SymmetricCryptoKey {
    key: string;
    keyB64: string;
    encKey: string;
    macKey: string;
    encType: EncryptionType;
    keyBuf: SymmetricCryptoKeyBuffers;

    constructor(keyBytes: string, b64KeyBytes?: boolean, encType?: EncryptionType) {
        if (b64KeyBytes) {
            keyBytes = forge.util.decode64(keyBytes);
        }

        if (!keyBytes) {
            throw new Error('Must provide keyBytes');
        }

        const buffer = (forge as any).util.createBuffer(keyBytes);
        if (!buffer || buffer.length() === 0) {
            throw new Error('Couldn\'t make buffer');
        }

        const bufferLength: number = buffer.length();

        if (encType == null) {
            if (bufferLength === 32) {
                encType = EncryptionType.AesCbc256_B64;
            } else if (bufferLength === 64) {
                encType = EncryptionType.AesCbc256_HmacSha256_B64;
            } else {
                throw new Error('Unable to determine encType.');
            }
        }

        this.key = keyBytes;
        this.keyB64 = forge.util.encode64(keyBytes);
        this.encType = encType;

        if (encType === EncryptionType.AesCbc256_B64 && bufferLength === 32) {
            this.encKey = keyBytes;
            this.macKey = null;
        } else if (encType === EncryptionType.AesCbc128_HmacSha256_B64 && bufferLength === 32) {
            this.encKey = buffer.getBytes(16); // first half
            this.macKey = buffer.getBytes(16); // second half
        } else if (encType === EncryptionType.AesCbc256_HmacSha256_B64 && bufferLength === 64) {
            this.encKey = buffer.getBytes(32); // first half
            this.macKey = buffer.getBytes(32); // second half
        } else {
            throw new Error('Unsupported encType/key length.');
        }
    }

    getBuffers() {
        if (this.keyBuf) {
            return this.keyBuf;
        }

        const key = UtilsService.fromB64ToArray(this.keyB64);
        const keys = new SymmetricCryptoKeyBuffers(key.buffer);

        if (this.macKey) {
            keys.encKey = key.slice(0, key.length / 2).buffer;
            keys.macKey = key.slice(key.length / 2).buffer;
        } else {
            keys.encKey = key.buffer;
            keys.macKey = null;
        }

        this.keyBuf = keys;
        return this.keyBuf;
    }
}
