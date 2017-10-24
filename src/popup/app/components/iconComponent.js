angular
    .module('bit.components')

    .component('icon', {
        bindings: {
            cipher: '<'
        },
        templateUrl: 'app/components/views/icon.html',
        controller: function (stateService, constantsService, environmentService) {
            var ctrl = this;
            ctrl.imageEnabled = stateService.getState('faviconEnabled');

            var iconsUrl = environmentService.iconsUrl;
            if (!iconsUrl) {
                if (environmentService.baseUrl) {
                    iconsUrl = environmentService.baseUrl + '/icons';
                }
                else {
                    iconsUrl = 'https://icons.bitwarden.com';
                }
            }

            ctrl.$onChanges = function () {
                switch (ctrl.cipher.type) {
                    case constantsService.cipherType.login:
                        ctrl.icon = 'fa-globe';
                        setLoginIcon(ctrl.cipher);
                        break;
                    case constantsService.cipherType.secureNote:
                        ctrl.icon = 'fa-sticky-note-o';
                        break;
                    case constantsService.cipherType.card:
                        ctrl.icon = 'fa-credit-card';
                        break;
                    case constantsService.cipherType.identity:
                        ctrl.icon = 'fa-id-card-o';
                        break;
                    default:
                        break;
                }
            };

            function setLoginIcon() {
                if (ctrl.cipher.login.uri) {
                    var hostnameUri = ctrl.cipher.login.uri,
                        isWebsite = false;

                    if (hostnameUri.indexOf('androidapp://') === 0) {
                        ctrl.icon = 'fa-android';
                        ctrl.image = null;
                    }
                    else if (hostnameUri.indexOf('iosapp://') === 0) {
                        ctrl.icon = 'fa-apple';
                        ctrl.image = null;
                    }
                    else if (ctrl.imageEnabled && hostnameUri.indexOf('://') === -1 && hostnameUri.indexOf('.') > -1) {
                        hostnameUri = "http://" + hostnameUri;
                        isWebsite = true;
                    }
                    else if (ctrl.imageEnabled) {
                        isWebsite = hostnameUri.indexOf('http') === 0 && hostnameUri.indexOf('.') > -1;
                    }

                    if (ctrl.imageEnabled && isWebsite) {
                        try {
                            var url = new URL(hostnameUri);
                            ctrl.image = iconsUrl + '/' + url.hostname + '/icon.png';
                            ctrl.fallbackImage = chrome.extension.getURL('images/fa-globe.png');
                        }
                        catch (e) { }
                    }
                }
                else {
                    ctrl.image = null;
                }
            }
        }
    });
