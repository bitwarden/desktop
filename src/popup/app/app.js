angular
    .module('bit', [
        'ionic',
        'angular-jwt',

        'bit.services',

        'bit.accounts',
        'bit.current',
        'bit.vault',
        'bit.settings',
        'bit.tools'
    ]);
