import { Domain, Response } from '@bitwarden/jslib';

export interface CryptoService {
    setKey(key: Domain.SymmetricCryptoKey): Promise<any>;
    setKeyHash(keyHash: string): Promise<{}>;
    setEncKey(encKey: string): Promise<{}>;
    setEncPrivateKey(encPrivateKey: string): Promise<{}>;
    setOrgKeys(orgs: Response.ProfileOrganization[]): Promise<{}>;
    getKey(): Promise<Domain.SymmetricCryptoKey>;
    getKeyHash(): Promise<string>;
    getEncKey(): Promise<Domain.SymmetricCryptoKey>;
    getPrivateKey(): Promise<ArrayBuffer>;
    getOrgKeys(): Promise<Map<string, Domain.SymmetricCryptoKey>>;
    getOrgKey(orgId: string): Promise<Domain.SymmetricCryptoKey>;
    clearKeys(): Promise<any>;
    toggleKey(): Promise<any>;
    makeKey(password: string, salt: string): Domain.SymmetricCryptoKey;
    hashPassword(password: string, key: Domain.SymmetricCryptoKey): Promise<string>;
    makeEncKey(key: Domain.SymmetricCryptoKey): Promise<Domain.CipherString>;
    encrypt(plainValue: string | Uint8Array, key?: Domain.SymmetricCryptoKey,
        plainValueEncoding?: string): Promise<Domain.CipherString>;
    encryptToBytes(plainValue: ArrayBuffer, key?: Domain.SymmetricCryptoKey): Promise<ArrayBuffer>;
    decrypt(cipherString: Domain.CipherString, key?: Domain.SymmetricCryptoKey,
        outputEncoding?: string): Promise<string>;
    decryptFromBytes(encBuf: ArrayBuffer, key: Domain.SymmetricCryptoKey): Promise<ArrayBuffer>;
    rsaDecrypt(encValue: string): Promise<string>;
}
