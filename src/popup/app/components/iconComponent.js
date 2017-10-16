angular
    .module('bit.components')

    .component('icon', {
        bindings: {
            cipher: '<'
        },
        template: '<div class="icon" ng-if="$ctrl.enabled">' +
        '<img src="{{$ctrl.image}}" fallback-src="{{$ctrl.fallbackImage}}" ng-if="$ctrl.image" alt="" />' +
        '<i class="fa fa-fw fa-lg {{$ctrl.icon}}" ng-if="!$ctrl.image"></i>' +
        '</div>',
        controller: function (stateService, constantsService) {
            var ctrl = this;

            ctrl.$onInit = function () {
                ctrl.enabled = stateService.getState('faviconEnabled');
                if (ctrl.enabled) {
                    switch (ctrl.cipher.type) {
                        case constantsService.cipherType.login:
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
                }
            };

            ctrl.$onChanges = function () {
                if (ctrl.cipher.type === constantsService.cipherType.login) {
                    setLoginIcon(ctrl.cipher);
                }
            };

            function setLoginIcon() {
                if (ctrl.cipher.login.uri) {
                    var hostnameUri = ctrl.cipher.login.uri,
                        isWebsite = false;

                    if (hostnameUri.indexOf('androidapp://') === 0) {
                        ctrl.icon = 'fa-android';
                    }
                    else if (hostnameUri.indexOf('iosapp://') === 0) {
                        ctrl.icon = 'fa-apple';
                    }
                    else if (hostnameUri.indexOf('://') === -1 && hostnameUri.indexOf('http://') !== 0 &&
                        hostnameUri.indexOf('https://') !== 0) {
                        hostnameUri = "http://" + hostnameUri;
                        isWebsite = true;
                    }
                    else {
                        isWebsite = hostnameUri.indexOf('http') === 0 && hostnameUri.indexOf('.') > 0;
                    }

                    if (isWebsite) {
                        try {
                            var url = new URL(hostnameUri);
                            ctrl.image = 'https://icons.bitwarden.com/' + url.hostname + '/icon.png';
                            ctrl.fallbackImage = chrome.extension.getURL('images/fa-globe.png');
                        }
                        catch (e) { }
                    }
                }

                if (!ctrl.icon) {
                    ctrl.icon = 'fa-globe';
                }
            }
        }
    });
