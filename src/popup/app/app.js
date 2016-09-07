angular
    .module('bit', [
        'ui.router',
        'angular-jwt',

        'bit.services',

        'bit.accounts',
        'bit.current',
        'bit.vault',
        'bit.settings',
        'bit.tools'
    ]);
