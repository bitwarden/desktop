export default class SymmetricCryptoKeyBuffers {
    key: ArrayBuffer;
    encKey?: ArrayBuffer;
    macKey?: ArrayBuffer;

    constructor(key: ArrayBuffer) {
        this.key = key;
    }
}
