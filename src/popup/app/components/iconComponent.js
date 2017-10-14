angular
    .module('bit.components')

    .component('icon', {
        bindings: {
            uri: '<'
        },
        template: '<div class="icon" ng-if="$ctrl.enabled()"><img src="{{$ctrl.url}}"></div>',
        controller: function (stateService) {
            this.$onInit = (function () {
                this.enabled = function () {
                    return stateService.getState('faviconEnabled');
                };
            }).bind(this);

            this.$onChanges = (function () {
                var hostname;
                try {
                    hostname = new URL(this.uri).hostname;
                    this.url = 'https://icons.bitwarden.com/' + hostname + '/icon.png';
                } catch (e) {
                    // Invalid URL.
                    this.url = chrome.extension.getURL('images/fa-globe.png');
                }
            }).bind(this);
        }
    });
