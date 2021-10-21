/* =================================================================================================

This file is almost a copy of :

Initial copied version :
https://github.com/bitwarden/browser/blob/5941a4387dabbeddf8abfc37d91ddee9613a32f0/src/browser/browserApi.ts#L1

Latest version :
https://github.com/bitwarden/browser/blob/master/src/services/browserPlatformUtils.service.ts#L1

================================================================================================= */

import manifest from '../../package.json' ; // tsconfig & tsconfig-browser properly configured despite the warning

export class BrowserApi {
    static getApplicationVersion(): string {
        return manifest.version;
    }

    static createNewTab(url: string, extensionPage: boolean = false) {
        window.open(url, '_blank');
    }

    static downloadFile(win: Window, blobData: any, blobOptions: any, fileName: string) {
        const blob = new Blob([blobData], blobOptions);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            const a = win.document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            win.document.body.appendChild(a);
            a.click();
            win.document.body.removeChild(a);
        }
    }
}
