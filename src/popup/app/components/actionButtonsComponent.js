angular
    .module('bit.components')

    .component('actionButtons', {
        bindings: {
            cipher: '<',
            showView: '<',
            onView: '&'
        },
        templateUrl: 'app/components/views/actionButtons.html',
        controller: function (i18nService, $analytics, constantsService, toastr, $timeout, $window, utilsService) {
            var ctrl = this;

            ctrl.$onInit = function () {
                ctrl.i18n = i18nService;
                ctrl.constants = constantsService;

                ctrl.launch = function () {
                    $timeout(function () {
                        if (ctrl.cipher.login.uri.startsWith('http://') || ctrl.cipher.login.uri.startsWith('https://')) {
                            $analytics.eventTrack('Launched Website From Listing');
                            chrome.tabs.create({ url: ctrl.cipher.login.uri });
                            if (utilsService.inPopup($window)) {
                                $window.close();
                            }
                        }
                    });
                };

                ctrl.clipboardError = function (e) {
                    toastr.info(i18n.browserNotSupportClipboard);
                };

                ctrl.clipboardSuccess = function (e, type, aType) {
                    e.clearSelection();
                    $analytics.eventTrack('Copied ' + aType);
                    toastr.info(type + i18nService.valueCopied);
                };
            };
        }
    });
