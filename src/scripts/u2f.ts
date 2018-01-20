export class U2f {
    private iframe: HTMLIFrameElement = null;
    private connectorLink: HTMLAnchorElement;

    constructor(private win: Window, private webVaultUrl: string, private successCallback: Function,
        private errorCallback: Function, private infoCallback: Function) {
        this.connectorLink = win.document.createElement('a');
        this.webVaultUrl = webVaultUrl != null && webVaultUrl !== '' ? webVaultUrl : 'https://vault.bitwarden.com';
    }

    init(data: any): void {
        this.connectorLink.href = this.webVaultUrl + '/u2f-connector.html' +
            '?data=' + this.base64Encode(JSON.stringify(data)) +
            '&parent=' + encodeURIComponent(this.win.document.location.href) +
            '&v=1';

        this.iframe = this.win.document.getElementById('u2f_iframe') as HTMLIFrameElement;
        this.iframe.src = this.connectorLink.href;

        this.win.addEventListener('message', (e) => this.parseMessage(e), false);
    }

    stop() {
        this.sendMessage('stop');
    }

    start() {
        this.sendMessage('start');
    }

    sendMessage(message: any) {
        if (!this.iframe || !this.iframe.src || !this.iframe.contentWindow) {
            return;
        }

        this.iframe.contentWindow.postMessage(message, this.iframe.src);
    }

    base64Encode(str: string): string {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode(('0x' + p1) as any);
        }));
    }

    cleanup() {
        this.win.removeEventListener('message', (e) => this.parseMessage(e), false);
    }

    private parseMessage(event: any) {
        if (!this.validMessage(event)) {
            this.errorCallback('Invalid message.');
            return;
        }

        const parts: string[] = event.data.split('|');
        if (parts[0] === 'success' && this.successCallback) {
            this.successCallback(parts[1]);
        } else if (parts[0] === 'error' && this.errorCallback) {
            this.errorCallback(parts[1]);
        } else if (parts[0] === 'info' && this.infoCallback) {
            this.infoCallback(parts[1]);
        }
    }

    private validMessage(event: any) {
        if (!event.origin || event.origin === '' || event.origin !== (this.connectorLink as any).origin) {
            return false;
        }

        return event.data.indexOf('success|') === 0 || event.data.indexOf('error|') === 0 ||
            event.data.indexOf('info|') === 0;
    }
}
