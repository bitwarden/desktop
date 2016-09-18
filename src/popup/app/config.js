angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider, toastrConfig) {
        jwtInterceptorProvider.urlParam = 'access_token';
        jwtInterceptorProvider.tokenGetter = /*@ngInject*/ function (config, appSettings, tokenService) {
            if (config.url.indexOf(appSettings.apiUri) === 0) {
                tokenService.getToken(function (token) {
                    return token;
                });
            }
        };

        angular.extend(toastrConfig, {
            closeButton: true,
            progressBar: true,
            showMethod: 'slideDown',
            positionClass: 'toast-bottom-center'
        });

        if ($httpProvider.defaults.headers.post) {
            $httpProvider.defaults.headers.post = {};
        }

        $httpProvider.defaults.headers.post['Content-Type'] = 'text/plain; charset=utf-8';

        //$httpProvider.interceptors.push('apiInterceptor');
        $httpProvider.interceptors.push('jwtInterceptor');

        $urlRouterProvider.otherwise(function ($injector, $location) {
            var $state = $injector.get('$state');
            $state.go('login');
        });

        $stateProvider
            .state('login', {
                url: '/login',
                controller: 'accountsLoginController',
                templateUrl: 'app/accounts/views/accountsLogin.html',
                data: { authorize: false },
                params: { animation: null }
            })
            .state('twoFactor', {
                url: '/two-factor',
                controller: 'accountsLoginController',
                templateUrl: 'app/accounts/views/accountsLoginTwoFactor.html',
                data: { authorize: false },
                params: { animation: null }
            })

            .state('tabs', {
                url: '/tab',
                abstract: true,
                templateUrl: 'app/global/tabs.html',
                data: { authorize: true },
                params: { animation: null }
            })
                .state('tabs.current', {
                    url: '/current',
                    templateUrl: 'app/current/views/current.html',
                    controller: 'currentController'
                })
                .state('tabs.vault', {
                    url: '/vault',
                    templateUrl: 'app/vault/views/vault.html',
                    controller: 'vaultController',
                    params: { scrollY: 0, searchText: null }
                })
                .state('tabs.settings', {
                    url: '/settings',
                    templateUrl: 'app/settings/views/settings.html',
                    controller: 'settingsController'
                })
                .state('tabs.tools', {
                    url: '/tools',
                    templateUrl: 'app/tools/views/tools.html',
                    controller: 'toolsController'
                })

            .state('viewSite', {
                url: '/view-site?siteId',
                templateUrl: 'app/vault/views/vaultViewSite.html',
                controller: 'vaultViewSiteController',
                data: { authorize: true },
                params: { animation: null, returnScrollY: 0, returnSearchText: null }
            })
            .state('addSite', {
                url: '/add-site',
                templateUrl: 'app/vault/views/vaultAddSite.html',
                controller: 'vaultAddSiteController',
                data: { authorize: true },
                params: { animation: null, returnScrollY: 0, returnSearchText: null, name: null, uri: null, site: null }
            })
            .state('editSite', {
                url: '/edit-site?siteId',
                templateUrl: 'app/vault/views/vaultEditSite.html',
                controller: 'vaultEditSiteController',
                data: { authorize: true },
                params: { animation: null, fromView: true, returnScrollY: 0, returnSearchText: null }
            })

            .state('passwordGenerator', {
                url: '/password-generator',
                templateUrl: 'app/tools/views/toolsPasswordGenerator.html',
                controller: 'toolsPasswordGeneratorController',
                data: { authorize: true },
                params: { animation: null, addState: null, editState: null }
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
