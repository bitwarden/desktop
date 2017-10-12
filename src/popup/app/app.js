angular
    .module('bit', [
        'ui.router',
        'ngAnimate',
        'toastr',
        'angulartics',
        'angulartics.google.analytics',

        'bit.directives',
        'bit.components',
        'bit.services',

        'bit.global',
        'bit.accounts',
        'bit.current',
        'bit.vault',
        'bit.settings',
        'bit.tools',
        'bit.lock'
    ]);
