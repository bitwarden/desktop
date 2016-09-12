angular
    .module('bit', [
        'ui.router',
        'angular-jwt',
        'ngAnimate',
        'toastr',

        'bit.directives',
        'bit.services',

        'bit.global',
        'bit.accounts',
        'bit.current',
        'bit.vault',
        'bit.settings',
        'bit.tools'
    ]);
