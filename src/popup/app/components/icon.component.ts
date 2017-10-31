import * as template from './icon.component.html';

class IconController implements ng.IController {
    cipher: any;
    icon: string;
    image: string;
    fallbackImage: string;
    imageEnabled: boolean;

    private iconsUrl: string;

    constructor(private stateService: any, private constantsService: any, private environmentService: any) {
        this.imageEnabled = stateService.getState('faviconEnabled');

        this.iconsUrl = environmentService.iconsUrl;
        if (!this.iconsUrl) {
            if (environmentService.baseUrl) {
                this.iconsUrl = environmentService.baseUrl + '/icons';
            }
            else {
                this.iconsUrl = 'https://icons.bitwarden.com';
            }
        }
    }

    $onChanges() {
        switch (this.cipher.type) {
            case this.constantsService.cipherType.login:
                this.icon = 'fa-globe';
                this.setLoginIcon();
                break;
            case this.constantsService.cipherType.secureNote:
                this.icon = 'fa-sticky-note-o';
                break;
            case this.constantsService.cipherType.card:
                this.icon = 'fa-credit-card';
                break;
            case this.constantsService.cipherType.identity:
                this.icon = 'fa-id-card-o';
                break;
            default:
                break;
        }
    }

    private setLoginIcon() {
        if (this.cipher.login.uri) {
            let hostnameUri = this.cipher.login.uri;
            let isWebsite = false;

            if (hostnameUri.indexOf('androidapp://') === 0) {
                this.icon = 'fa-android';
                this.image = null;
            }
            else if (hostnameUri.indexOf('iosapp://') === 0) {
                this.icon = 'fa-apple';
                this.image = null;
            }
            else if (this.imageEnabled && hostnameUri.indexOf('://') === -1 && hostnameUri.indexOf('.') > -1) {
                hostnameUri = 'http://' + hostnameUri;
                isWebsite = true;
            }
            else if (this.imageEnabled) {
                isWebsite = hostnameUri.indexOf('http') === 0 && hostnameUri.indexOf('.') > -1;
            }

            if (this.imageEnabled && isWebsite) {
                try {
                    const url = new URL(hostnameUri);
                    this.image = this.iconsUrl + '/' + url.hostname + '/icon.png';
                    this.fallbackImage = chrome.extension.getURL('images/fa-globe.png');
                }
                catch (e) { }
            }
        }
        else {
            this.image = null;
        }
    }
}

export const IconComponent = {
    bindings: {
        cipher: '<',
    },
    controller: IconController,
    template,
};
