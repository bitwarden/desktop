angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider) {
        jwtInterceptorProvider.urlParam = 'access_token';
        jwtInterceptorProvider.tokenGetter = /*@ngInject*/ function (config, appSettings, tokenService) {
            if (config.url.indexOf(appSettings.apiUri) === 0) {
                tokenService.getToken(function (token) {
                    return token;
                });
            }
        };

        if ($httpProvider.defaults.headers.post) {
            $httpProvider.defaults.headers.post = {};
        }

        $httpProvider.defaults.headers.post['Content-Type'] = 'text/plain; charset=utf-8';

        //$httpProvider.interceptors.push('apiInterceptor');
        $httpProvider.interceptors.push('jwtInterceptor');

        $urlRouterProvider.otherwise(function ($injector, $location) {
            var $state = $injector.get("$state");
            $state.go("login");
        });

        $stateProvider
            .state('login', {
                url: "/login",
                controller: 'accountsLoginController',
                templateUrl: "app/accounts/views/accountsLogin.html",
                data: {
                    authorize: false
                }
            })
                .state('login.twoFactor', {
                    url: "/two-factor",
                    controller: 'accountsLoginController',
                    templateUrl: "app/accounts/views/accountsLoginTwoFactor.html"
                })

            .state('tabs', {
                url: "/tab",
                abstract: true,
                templateUrl: "app/global/tabs.html",
                data: {
                    authorize: true
                }
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
    })
    .run(function ($rootScope, userService, loginService, tokenService, $state) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            tokenService.getToken(function (token) {
                userService.isAuthenticated(function (isAuthenticated) {
                    if (!toState.data || !toState.data.authorize) {
                        if (isAuthenticated && !tokenService.isTokenExpired(token)) {
                            event.preventDefault();
                            $state.go('tabs.current');
                        }

                        return;
                    }

                    if (!isAuthenticated || tokenService.isTokenExpired(token)) {
                        event.preventDefault();
                        loginService.logOut(function () {
                            $state.go('login');
                        });
                    }
                });
            });
        });
    });
