angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('tabs', {
                url: "/tab",
                abstract: true,
                templateUrl: "app/global/tabs.html"
            })
            .state('tabs.current', {
                url: "/current",
                views: {
                    'current-tab': {
                        templateUrl: "app/current/views/current.html",
                        controller: 'currentController'
                    }
                }
            })
            .state('tabs.vault', {
                url: "/vault",
                views: {
                    'vault-tab': {
                        templateUrl: "app/vault/views/vault.html",
                        controller: 'vaultController'
                    }
                }
            })
            .state('tabs.settings', {
                url: "/settings",
                views: {
                    'settings-tab': {
                        templateUrl: "app/settings/views/settings.html",
                        controller: 'settingsController'
                    }
                }
            })
            .state('tabs.tools', {
                url: "/tools",
                views: {
                    'tools-tab': {
                        templateUrl: "app/tools/views/tools.html",
                        controller: 'toolsController'
                    }
                }
            });


        $urlRouterProvider.otherwise("/tab/current");
    });
