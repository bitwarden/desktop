import SymmetricCryptoKey from './symmetricCryptoKey';

export default class EncryptedObject {
    iv: Uint8Array;
    ct: Uint8Array;
    mac: Uint8Array;
    key: SymmetricCryptoKey;
}
