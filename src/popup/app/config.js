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
            $state.go('home');
        });

        $stateProvider
            .state('splash', {
                url: '/splash',
                controller: 'splashController',
                templateUrl: 'app/global/splash.html',
                data: { authorize: false },
                params: { animation: null }
            })
            .state('home', {
                url: '/home',
                controller: 'homeController',
                templateUrl: 'app/global/home.html',
                data: { authorize: false },
                params: { animation: null }
            })

            .state('login', {
                url: '/login',
                controller: 'accountsLoginController',
                templateUrl: 'app/accounts/views/accountsLogin.html',
                data: { authorize: false },
                params: { animation: null, email: null }
            })
            .state('hint', {
                url: '/hint',
                controller: 'accountsHintController',
                templateUrl: 'app/accounts/views/accountsHint.html',
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
            .state('register', {
                url: '/register',
                controller: 'accountsRegisterController',
                templateUrl: 'app/accounts/views/accountsRegister.html',
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
                params: { animation: null, returnScrollY: 0, returnSearchText: null, name: null, uri: null, site: null, fromCurrent: false }
            })
            .state('editSite', {
                url: '/edit-site?siteId',
                templateUrl: 'app/vault/views/vaultEditSite.html',
                controller: 'vaultEditSiteController',
                data: { authorize: true },
                params: { animation: null, fromView: true, returnScrollY: 0, returnSearchText: null, site: null }
            })

            .state('passwordGenerator', {
                url: '/password-generator',
                templateUrl: 'app/tools/views/toolsPasswordGenerator.html',
                controller: 'toolsPasswordGeneratorController',
                data: { authorize: true },
                params: { animation: null, addState: null, editState: null }
            })

            .state('about', {
                url: '/about',
                templateUrl: 'app/settings/views/settingsAbout.html',
                controller: 'settingsAboutController',
                data: { authorize: true },
                params: { animation: null }
            })

            .state('help', {
                url: '/help',
                templateUrl: 'app/settings/views/settingsHelp.html',
                controller: 'settingsHelpController',
                data: { authorize: true },
                params: { animation: null }
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
                            $state.go('home');
                        });
                    }
                });
            });
        });
    });
