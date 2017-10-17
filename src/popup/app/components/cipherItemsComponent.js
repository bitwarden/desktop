angular
    .module('bit.components')

    .component('cipherItems', {
        bindings: {
            ciphers: '<',
            selectionTitle: '<',
            onView: '&',
            onSelected: '&'
        },
        templateUrl: 'app/components/views/cipherItems.html',
        controller: function (i18nService) {
            var ctrl = this;

            ctrl.$onInit = function () {
                ctrl.i18n = i18nService;

                ctrl.view = function (cipher) {
                    ctrl.onView()(cipher);
                };

                ctrl.select = function (cipher) {
                    ctrl.onSelected()(cipher);
                };
            };
        }
    });
