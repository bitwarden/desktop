import ConstantsService from './constants.service';
import UtilsService from './utils.service';

const b32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const TotpAlgorithm = {
    name: 'HMAC',
    hash: { name: 'SHA-1' },
};

export default class TotpService {
    async getCode(keyb32: string): Promise<string> {
        const epoch = Math.round(new Date().getTime() / 1000.0);
        const timeHex = this.leftpad(this.dec2hex(Math.floor(epoch / 30)), 16, '0');
        const timeBytes = this.hex2bytes(timeHex);
        const keyBytes = this.b32tobytes(keyb32);

        if (!keyBytes.length || !timeBytes.length) {
            return null;
        }

        const hashHex = await this.sign(keyBytes, timeBytes);
        if (!hashHex) {
            return null;
        }

        const offset = this.hex2dec(hashHex.substring(hashHex.length - 1));
        // tslint:disable-next-line
        let otp = (this.hex2dec(hashHex.substr(offset * 2, 8)) & this.hex2dec('7fffffff')) + '';
        otp = (otp).substr(otp.length - 6, 6);
        return otp;
    }

    async isAutoCopyEnabled(): Promise<boolean> {
        return !(await UtilsService.getObjFromStorage<boolean>(ConstantsService.disableAutoTotpCopyKey));
    }

    // Helpers

    private leftpad(s: string, l: number, p: string): string {
        if (l + 1 >= s.length) {
            s = Array(l + 1 - s.length).join(p) + s;
        }
        return s;
    }

    private dec2hex(d: number): string {
        return (d < 15.5 ? '0' : '') + Math.round(d).toString(16);
    }

    private hex2dec(s: string): number {
        return parseInt(s, 16);
    }

    private hex2bytes(s: string): Uint8Array {
        const bytes = new Uint8Array(s.length / 2);
        for (let i = 0; i < s.length; i += 2) {
            bytes[i / 2] = parseInt(s.substr(i, 2), 16);
        }
        return bytes;
    }

    private buff2hex(buff: ArrayBuffer): string {
        const bytes = new Uint8Array(buff);
        const hex: string[] = [];
        bytes.forEach((b) => {
            // tslint:disable-next-line
            hex.push((b >>> 4).toString(16));
            // tslint:disable-next-line
            hex.push((b & 0xF).toString(16));
        });
        return hex.join('');
    }

    private b32tohex(s: string): string {
        s = s.toUpperCase();
        let cleanedInput = '';

        for (let i = 0; i < s.length; i++) {
            if (b32Chars.indexOf(s[i]) < 0) {
                continue;
            }

            cleanedInput += s[i];
        }
        s = cleanedInput;

        let bits = '';
        let hex = '';
        for (let i = 0; i < s.length; i++) {
            const byteIndex = b32Chars.indexOf(s.charAt(i));
            if (byteIndex < 0) {
                continue;
            }
            bits += this.leftpad(byteIndex.toString(2), 5, '0');
        }
        for (let i = 0; i + 4 <= bits.length; i += 4) {
            const chunk = bits.substr(i, 4);
            hex = hex + parseInt(chunk, 2).toString(16);
        }
        return hex;
    }

    private b32tobytes(s: string): Uint8Array {
        return this.hex2bytes(this.b32tohex(s));
    }

    private async sign(keyBytes: Uint8Array, timeBytes: Uint8Array) {
        const key = await window.crypto.subtle.importKey('raw', keyBytes, TotpAlgorithm, false, ['sign']);
        const signature = await window.crypto.subtle.sign(TotpAlgorithm, key, timeBytes);
        return this.buff2hex(signature);
    }
}
