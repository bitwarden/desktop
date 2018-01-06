import { UtilsService as UtilsServiceInterface } from '@bitwarden/jslib';

export default class UtilsService implements UtilsServiceInterface {
    static copyToClipboard(text: string, doc?: Document): void {
        doc = doc || document;
        if ((window as any).clipboardData && (window as any).clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            (window as any).clipboardData.setData('Text', text);
        } else if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
            const textarea = doc.createElement('textarea');
            textarea.textContent = text;
            // Prevent scrolling to bottom of page in MS Edge.
            textarea.style.position = 'fixed';
            doc.body.appendChild(textarea);
            textarea.select();

            try {
                // Security exception may be thrown by some browsers.
                doc.execCommand('copy');
            } catch (e) {
                // tslint:disable-next-line
                console.warn('Copy to clipboard failed.', e);
            } finally {
                doc.body.removeChild(textarea);
            }
        }
    }

    static urlBase64Decode(str: string): string {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw new Error('Illegal base64url string!');
        }

        return decodeURIComponent(escape(window.atob(output)));
    }

    // ref: http://stackoverflow.com/a/2117523/1090359
    static newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            // tslint:disable-next-line
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // EFForg/OpenWireless
    // ref https://github.com/EFForg/OpenWireless/blob/master/app/js/diceware.js
    static secureRandomNumber(min: number, max: number): number {
        let rval = 0;
        const range = max - min + 1;
        const bitsNeeded = Math.ceil(Math.log2(range));
        if (bitsNeeded > 53) {
            throw new Error('We cannot generate numbers larger than 53 bits.');
        }

        const bytesNeeded = Math.ceil(bitsNeeded / 8);
        const mask = Math.pow(2, bitsNeeded) - 1;
        // 7776 -> (2^13 = 8192) -1 == 8191 or 0x00001111 11111111

        // Create byte array and fill with N random numbers
        const byteArray = new Uint8Array(bytesNeeded);
        window.crypto.getRandomValues(byteArray);

        let p = (bytesNeeded - 1) * 8;
        for (let i = 0; i < bytesNeeded; i++) {
            rval += byteArray[i] * Math.pow(2, p);
            p -= 8;
        }

        // Use & to apply the mask and reduce the number of recursive lookups
        // tslint:disable-next-line
        rval = rval & mask;

        if (rval >= range) {
            // Integer out of acceptable range
            return UtilsService.secureRandomNumber(min, max);
        }

        // Return an integer that falls within the range
        return min + rval;
    }

    static fromB64ToArray(str: string): Uint8Array {
        const binaryString = window.atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    static fromUtf8ToArray(str: string): Uint8Array {
        const strUtf8 = unescape(encodeURIComponent(str));
        const arr = new Uint8Array(strUtf8.length);
        for (let i = 0; i < strUtf8.length; i++) {
            arr[i] = strUtf8.charCodeAt(i);
        }
        return arr;
    }

    static fromBufferToB64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    static fromBufferToUtf8(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        const encodedString = String.fromCharCode.apply(null, bytes);
        return decodeURIComponent(escape(encodedString));
    }

    static getHostname(uriString: string): string {
        if (uriString == null) {
            return null;
        }

        uriString = uriString.trim();
        if (uriString === '') {
            return null;
        }

        if (uriString.startsWith('http://') || uriString.startsWith('https://')) {
            try {
                const url = new URL(uriString);
                return url.hostname;
            } catch (e) { }
        }

        return null;
    }

    getHostname(uriString: string): string {
        return UtilsService.getHostname(uriString);
    }

    copyToClipboard(text: string, doc?: Document) {
        UtilsService.copyToClipboard(text, doc);
    }
}
