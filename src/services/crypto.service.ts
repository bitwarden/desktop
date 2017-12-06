import * as forge from 'node-forge';

import { EncryptionType } from '../enums/encryptionType.enum';

import { CipherString } from '../models/domain/cipherString';
import EncryptedObject from '../models/domain/encryptedObject';
import SymmetricCryptoKey from '../models/domain/symmetricCryptoKey';
import { ProfileOrganizationResponse } from '../models/response/profileOrganizationResponse';

import ConstantsService from './constants.service';
import UtilsService from './utils.service';

import { CryptoService as CryptoServiceInterface } from './abstractions/crypto.service';

const Keys = {
    key: 'key',
    encOrgKeys: 'encOrgKeys',
    encPrivateKey: 'encPrivateKey',
    encKey: 'encKey',
    keyHash: 'keyHash',
};

const SigningAlgorithm = {
    name: 'HMAC',
    hash: { name: 'SHA-256' },
};

const AesAlgorithm = {
    name: 'AES-CBC',
};

const Crypto = window.crypto;
const Subtle = Crypto.subtle;

export default class CryptoService implements CryptoServiceInterface {
    private key: SymmetricCryptoKey;
    private encKey: SymmetricCryptoKey;
    private legacyEtmKey: SymmetricCryptoKey;
    private keyHash: string;
    private privateKey: ArrayBuffer;
    private orgKeys: Map<string, SymmetricCryptoKey>;

    async setKey(key: SymmetricCryptoKey): Promise<any> {
        this.key = key;

        const option = await UtilsService.getObjFromStorage<number>(ConstantsService.lockOptionKey);
        if (option != null) {
            // if we have a lock option set, we do not store the key
            return;
        }

        return UtilsService.saveObjToStorage(Keys.key, key.keyB64);
    }

    setKeyHash(keyHash: string): Promise<{}> {
        this.keyHash = keyHash;
        return UtilsService.saveObjToStorage(Keys.keyHash, keyHash);
    }

    async setEncKey(encKey: string): Promise<{}> {
        if (encKey == null) {
            return;
        }
        await UtilsService.saveObjToStorage(Keys.encKey, encKey);
        this.encKey = null;
    }

    async setEncPrivateKey(encPrivateKey: string): Promise<{}> {
        if (encPrivateKey == null) {
            return;
        }

        await UtilsService.saveObjToStorage(Keys.encPrivateKey, encPrivateKey);
        this.privateKey = null;
    }

    setOrgKeys(orgs: ProfileOrganizationResponse[]): Promise<{}> {
        const orgKeys: any = {};
        orgs.forEach((org) => {
            orgKeys[org.id] = org.key;
        });

        return UtilsService.saveObjToStorage(Keys.encOrgKeys, orgKeys);
    }

    async getKey(): Promise<SymmetricCryptoKey> {
        if (this.key != null) {
            return this.key;
        }

        const option = await UtilsService.getObjFromStorage<number>(ConstantsService.lockOptionKey);
        if (option != null) {
            return null;
        }

        const key = await UtilsService.getObjFromStorage<string>(Keys.key);
        if (key) {
            this.key = new SymmetricCryptoKey(key, true);
        }

        return key == null ? null : this.key;
    }

    getKeyHash(): Promise<string> {
        if (this.keyHash != null) {
            return Promise.resolve(this.keyHash);
        }

        return UtilsService.getObjFromStorage<string>(Keys.keyHash);
    }

    async getEncKey(): Promise<SymmetricCryptoKey> {
        if (this.encKey != null) {
            return this.encKey;
        }

        const encKey = await UtilsService.getObjFromStorage<string>(Keys.encKey);
        if (encKey == null) {
            return null;
        }

        const key = await this.getKey();
        if (key == null) {
            return null;
        }

        const decEncKey = await this.decrypt(new CipherString(encKey), key, 'raw');
        if (decEncKey == null) {
            return null;
        }

        this.encKey = new SymmetricCryptoKey(decEncKey);
        return this.encKey;
    }

    async getPrivateKey(): Promise<ArrayBuffer> {
        if (this.privateKey != null) {
            return this.privateKey;
        }

        const encPrivateKey = await UtilsService.getObjFromStorage<string>(Keys.encPrivateKey);
        if (encPrivateKey == null) {
            return null;
        }

        const privateKey = await this.decrypt(new CipherString(encPrivateKey), null, 'raw');
        const privateKeyB64 = forge.util.encode64(privateKey);
        this.privateKey = UtilsService.fromB64ToArray(privateKeyB64).buffer;
        return this.privateKey;
    }

    async getOrgKeys(): Promise<Map<string, SymmetricCryptoKey>> {
        if (this.orgKeys != null && this.orgKeys.size > 0) {
            return this.orgKeys;
        }

        const self = this;
        const encOrgKeys = await UtilsService.getObjFromStorage<any>(Keys.encOrgKeys);
        if (!encOrgKeys) {
            return null;
        }

        const orgKeys: Map<string, SymmetricCryptoKey> = new Map<string, SymmetricCryptoKey>();
        let setKey = false;

        for (const orgId in encOrgKeys) {
            if (!encOrgKeys.hasOwnProperty(orgId)) {
                continue;
            }

            const decValueB64 = await this.rsaDecrypt(encOrgKeys[orgId]);
            orgKeys.set(orgId, new SymmetricCryptoKey(decValueB64, true));
            setKey = true;
        }

        if (setKey) {
            this.orgKeys = orgKeys;
        }

        return this.orgKeys;
    }

    async getOrgKey(orgId: string): Promise<SymmetricCryptoKey> {
        if (orgId == null) {
            return null;
        }

        const orgKeys = await this.getOrgKeys();
        if (orgKeys == null || !orgKeys.has(orgId)) {
            return null;
        }

        return orgKeys.get(orgId);
    }

    clearKey(): Promise<any> {
        this.key = this.legacyEtmKey = null;
        return UtilsService.removeFromStorage(Keys.key);
    }

    clearKeyHash(): Promise<any> {
        this.keyHash = null;
        return UtilsService.removeFromStorage(Keys.keyHash);
    }

    clearEncKey(memoryOnly?: boolean): Promise<any> {
        this.encKey = null;
        if (memoryOnly) {
            return Promise.resolve();
        }
        return UtilsService.removeFromStorage(Keys.encKey);
    }

    clearPrivateKey(memoryOnly?: boolean): Promise<any> {
        this.privateKey = null;
        if (memoryOnly) {
            return Promise.resolve();
        }
        return UtilsService.removeFromStorage(Keys.encPrivateKey);
    }

    clearOrgKeys(memoryOnly?: boolean): Promise<any> {
        this.orgKeys = null;
        if (memoryOnly) {
            return Promise.resolve();
        }
        return UtilsService.removeFromStorage(Keys.encOrgKeys);
    }

    clearKeys(): Promise<any> {
        return Promise.all([
            this.clearKey(),
            this.clearKeyHash(),
            this.clearOrgKeys(),
            this.clearEncKey(),
            this.clearPrivateKey(),
        ]);
    }

    async toggleKey(): Promise<any> {
        const key = await this.getKey();
        const option = await UtilsService.getObjFromStorage(ConstantsService.lockOptionKey);
        if (option != null || option === 0) {
            // if we have a lock option set, clear the key
            await this.clearKey();
            this.key = key;
            return;
        }

        await this.setKey(key);
    }

    makeKey(password: string, salt: string): SymmetricCryptoKey {
        const keyBytes: string = (forge as any).pbkdf2(forge.util.encodeUtf8(password), forge.util.encodeUtf8(salt),
            5000, 256 / 8, 'sha256');
        return new SymmetricCryptoKey(keyBytes);
    }

    async hashPassword(password: string, key: SymmetricCryptoKey): Promise<string> {
        const storedKey = await this.getKey();
        key = key || storedKey;
        if (!password || !key) {
            throw new Error('Invalid parameters.');
        }

        const hashBits = (forge as any).pbkdf2(key.key, forge.util.encodeUtf8(password), 1, 256 / 8, 'sha256');
        return forge.util.encode64(hashBits);
    }

    makeEncKey(key: SymmetricCryptoKey): Promise<CipherString> {
        const bytes = new Uint8Array(512 / 8);
        Crypto.getRandomValues(bytes);
        return this.encrypt(bytes, key, 'raw');
    }

    async encrypt(plainValue: string | Uint8Array, key?: SymmetricCryptoKey,
        plainValueEncoding: string = 'utf8'): Promise<CipherString> {
        if (!plainValue) {
            return Promise.resolve(null);
        }

        let plainValueArr: Uint8Array;
        if (plainValueEncoding === 'utf8') {
            plainValueArr = UtilsService.fromUtf8ToArray(plainValue as string);
        } else {
            plainValueArr = plainValue as Uint8Array;
        }

        const encValue = await this.aesEncrypt(plainValueArr.buffer, key);
        const iv = UtilsService.fromBufferToB64(encValue.iv.buffer);
        const ct = UtilsService.fromBufferToB64(encValue.ct.buffer);
        const mac = encValue.mac ? UtilsService.fromBufferToB64(encValue.mac.buffer) : null;
        return new CipherString(encValue.key.encType, iv, ct, mac);
    }

    async encryptToBytes(plainValue: ArrayBuffer, key?: SymmetricCryptoKey): Promise<ArrayBuffer> {
        const encValue = await this.aesEncrypt(plainValue, key);
        let macLen = 0;
        if (encValue.mac) {
            macLen = encValue.mac.length;
        }

        const encBytes = new Uint8Array(1 + encValue.iv.length + macLen + encValue.ct.length);
        encBytes.set([encValue.key.encType]);
        encBytes.set(encValue.iv, 1);
        if (encValue.mac) {
            encBytes.set(encValue.mac, 1 + encValue.iv.length);
        }

        encBytes.set(encValue.ct, 1 + encValue.iv.length + macLen);
        return encBytes.buffer;
    }

    async decrypt(cipherString: CipherString, key?: SymmetricCryptoKey,
        outputEncoding: string = 'utf8'): Promise<string> {
        const ivBytes: string = forge.util.decode64(cipherString.initializationVector);
        const ctBytes: string = forge.util.decode64(cipherString.cipherText);
        const macBytes: string = cipherString.mac ? forge.util.decode64(cipherString.mac) : null;
        const decipher = await this.aesDecrypt(cipherString.encryptionType, ctBytes, ivBytes, macBytes, key);
        if (!decipher) {
            return null;
        }

        if (outputEncoding === 'utf8') {
            return decipher.output.toString('utf8');
        } else {
            return decipher.output.getBytes();
        }
    }

    async decryptFromBytes(encBuf: ArrayBuffer, key: SymmetricCryptoKey): Promise<ArrayBuffer> {
        if (!encBuf) {
            throw new Error('no encBuf.');
        }

        const encBytes = new Uint8Array(encBuf);
        const encType = encBytes[0];
        let ctBytes: Uint8Array = null;
        let ivBytes: Uint8Array = null;
        let macBytes: Uint8Array = null;

        switch (encType) {
            case EncryptionType.AesCbc128_HmacSha256_B64:
            case EncryptionType.AesCbc256_HmacSha256_B64:
                if (encBytes.length <= 49) { // 1 + 16 + 32 + ctLength
                    return null;
                }

                ivBytes = encBytes.slice(1, 17);
                macBytes = encBytes.slice(17, 49);
                ctBytes = encBytes.slice(49);
                break;
            case EncryptionType.AesCbc256_B64:
                if (encBytes.length <= 17) { // 1 + 16 + ctLength
                    return null;
                }

                ivBytes = encBytes.slice(1, 17);
                ctBytes = encBytes.slice(17);
                break;
            default:
                return null;
        }

        return await this.aesDecryptWC(encType, ctBytes.buffer, ivBytes.buffer, macBytes ? macBytes.buffer : null, key);
    }

    async rsaDecrypt(encValue: string): Promise<string> {
        const headerPieces = encValue.split('.');
        let encType: EncryptionType = null;
        let encPieces: string[];

        if (headerPieces.length === 1) {
            encType = EncryptionType.Rsa2048_OaepSha256_B64;
            encPieces = [headerPieces[0]];
        } else if (headerPieces.length === 2) {
            try {
                encType = parseInt(headerPieces[0], null);
                encPieces = headerPieces[1].split('|');
            } catch (e) { }
        }

        switch (encType) {
            case EncryptionType.Rsa2048_OaepSha256_B64:
            case EncryptionType.Rsa2048_OaepSha1_B64:
                if (encPieces.length !== 1) {
                    throw new Error('Invalid cipher format.');
                }
                break;
            case EncryptionType.Rsa2048_OaepSha256_HmacSha256_B64:
            case EncryptionType.Rsa2048_OaepSha1_HmacSha256_B64:
                if (encPieces.length !== 2) {
                    throw new Error('Invalid cipher format.');
                }
                break;
            default:
                throw new Error('encType unavailable.');
        }

        if (encPieces == null || encPieces.length <= 0) {
            throw new Error('encPieces unavailable.');
        }

        const key = await this.getEncKey();
        if (key != null && key.macKey != null && encPieces.length > 1) {
            const ctBytes: string = forge.util.decode64(encPieces[0]);
            const macBytes: string = forge.util.decode64(encPieces[1]);
            const computedMacBytes = await this.computeMac(ctBytes, key.macKey, false);
            const macsEqual = await this.macsEqual(key.macKey, macBytes, computedMacBytes);
            if (!macsEqual) {
                throw new Error('MAC failed.');
            }
        }

        const privateKeyBytes = await this.getPrivateKey();
        if (!privateKeyBytes) {
            throw new Error('No private key.');
        }

        let rsaAlgorithm: any = null;
        switch (encType) {
            case EncryptionType.Rsa2048_OaepSha256_B64:
            case EncryptionType.Rsa2048_OaepSha256_HmacSha256_B64:
                rsaAlgorithm = {
                    name: 'RSA-OAEP',
                    hash: { name: 'SHA-256' },
                };
                break;
            case EncryptionType.Rsa2048_OaepSha1_B64:
            case EncryptionType.Rsa2048_OaepSha1_HmacSha256_B64:
                rsaAlgorithm = {
                    name: 'RSA-OAEP',
                    hash: { name: 'SHA-1' },
                };
                break;
            default:
                throw new Error('encType unavailable.');
        }

        const privateKey = await Subtle.importKey('pkcs8', privateKeyBytes, rsaAlgorithm, false, ['decrypt']);
        const ctArr = UtilsService.fromB64ToArray(encPieces[0]);
        const decBytes = await Subtle.decrypt(rsaAlgorithm, privateKey, ctArr.buffer);
        const b64DecValue = UtilsService.fromBufferToB64(decBytes);
        return b64DecValue;
    }

    // Helpers

    private async aesEncrypt(plainValue: ArrayBuffer, key: SymmetricCryptoKey): Promise<EncryptedObject> {
        const obj = new EncryptedObject();
        obj.key = await this.getKeyForEncryption(key);
        const keyBuf = obj.key.getBuffers();

        obj.iv = new Uint8Array(16);
        Crypto.getRandomValues(obj.iv);

        const encKey = await Subtle.importKey('raw', keyBuf.encKey, AesAlgorithm, false, ['encrypt']);
        const encValue = await Subtle.encrypt({ name: 'AES-CBC', iv: obj.iv }, encKey, plainValue);
        obj.ct = new Uint8Array(encValue);

        if (keyBuf.macKey) {
            const data = new Uint8Array(obj.iv.length + obj.ct.length);
            data.set(obj.iv, 0);
            data.set(obj.ct, obj.iv.length);
            const mac = await this.computeMacWC(data.buffer, keyBuf.macKey);
            obj.mac = new Uint8Array(mac);
        }

        return obj;
    }

    private async aesDecrypt(encType: EncryptionType, ctBytes: string, ivBytes: string, macBytes: string,
        key: SymmetricCryptoKey): Promise<any> {
        const keyForEnc = await this.getKeyForEncryption(key);
        const theKey = this.resolveLegacyKey(encType, keyForEnc);

        if (encType !== theKey.encType) {
            // tslint:disable-next-line
            console.error('encType unavailable.');
            return null;
        }

        if (theKey.macKey != null && macBytes != null) {
            const computedMacBytes = this.computeMac(ivBytes + ctBytes, theKey.macKey, false);
            if (!this.macsEqual(theKey.macKey, computedMacBytes, macBytes)) {
                // tslint:disable-next-line
                console.error('MAC failed.');
                return null;
            }
        }

        const ctBuffer = (forge as any).util.createBuffer(ctBytes);
        const decipher = (forge as any).cipher.createDecipher('AES-CBC', theKey.encKey);
        decipher.start({ iv: ivBytes });
        decipher.update(ctBuffer);
        decipher.finish();

        return decipher;
    }

    private async aesDecryptWC(encType: EncryptionType, ctBuf: ArrayBuffer, ivBuf: ArrayBuffer,
        macBuf: ArrayBuffer, key: SymmetricCryptoKey): Promise<ArrayBuffer> {
        const theKey = await this.getKeyForEncryption(key);
        const keyBuf = theKey.getBuffers();
        const encKey = await Subtle.importKey('raw', keyBuf.encKey, AesAlgorithm, false, ['decrypt']);
        if (!keyBuf.macKey || !macBuf) {
            return null;
        }

        const data = new Uint8Array(ivBuf.byteLength + ctBuf.byteLength);
        data.set(new Uint8Array(ivBuf), 0);
        data.set(new Uint8Array(ctBuf), ivBuf.byteLength);
        const computedMacBuf = await this.computeMacWC(data.buffer, keyBuf.macKey);
        if (computedMacBuf === null) {
            return null;
        }

        const macsMatch = await this.macsEqualWC(keyBuf.macKey, macBuf, computedMacBuf);
        if (macsMatch === false) {
            // tslint:disable-next-line
            console.error('MAC failed.');
            return null;
        }

        return await Subtle.decrypt({ name: 'AES-CBC', iv: ivBuf }, encKey, ctBuf);
    }

    private computeMac(dataBytes: string, macKey: string, b64Output: boolean): string {
        const hmac = (forge as any).hmac.create();
        hmac.start('sha256', macKey);
        hmac.update(dataBytes);
        const mac = hmac.digest();
        return b64Output ? forge.util.encode64(mac.getBytes()) : mac.getBytes();
    }

    private async computeMacWC(dataBuf: ArrayBuffer, macKeyBuf: ArrayBuffer): Promise<ArrayBuffer> {
        const key = await Subtle.importKey('raw', macKeyBuf, SigningAlgorithm, false, ['sign']);
        return await Subtle.sign(SigningAlgorithm, key, dataBuf);
    }

    // Safely compare two MACs in a way that protects against timing attacks (Double HMAC Verification).
    // ref: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2011/february/double-hmac-verification/
    private macsEqual(macKey: string, mac1: string, mac2: string): boolean {
        const hmac = (forge as any).hmac.create();

        hmac.start('sha256', macKey);
        hmac.update(mac1);
        const mac1Bytes = hmac.digest().getBytes();

        hmac.start(null, null);
        hmac.update(mac2);
        const mac2Bytes = hmac.digest().getBytes();

        return mac1Bytes === mac2Bytes;
    }

    private async macsEqualWC(macKeyBuf: ArrayBuffer, mac1Buf: ArrayBuffer, mac2Buf: ArrayBuffer): Promise<boolean> {
        const macKey = await Subtle.importKey('raw', macKeyBuf, SigningAlgorithm, false, ['sign']);
        const mac1 = await Subtle.sign(SigningAlgorithm, macKey, mac1Buf);
        const mac2 = await Subtle.sign(SigningAlgorithm, macKey, mac2Buf);

        if (mac1.byteLength !== mac2.byteLength) {
            return false;
        }

        const arr1 = new Uint8Array(mac1);
        const arr2 = new Uint8Array(mac2);

        for (let i = 0; i < arr2.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }

        return true;
    }

    private async getKeyForEncryption(key?: SymmetricCryptoKey): Promise<SymmetricCryptoKey> {
        if (key) {
            return key;
        }

        const encKey = await this.getEncKey();
        return encKey || (await this.getKey());
    }

    private resolveLegacyKey(encType: EncryptionType, key: SymmetricCryptoKey): SymmetricCryptoKey {
        if (encType === EncryptionType.AesCbc128_HmacSha256_B64 && key.encType === EncryptionType.AesCbc256_B64) {
            // Old encrypt-then-mac scheme, make a new key
            this.legacyEtmKey = this.legacyEtmKey ||
                new SymmetricCryptoKey(key.key, false, EncryptionType.AesCbc128_HmacSha256_B64);
            return this.legacyEtmKey;
        }

        return key;
    }
}
