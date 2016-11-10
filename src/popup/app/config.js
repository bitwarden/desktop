angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, toastrConfig) {
        angular.extend(toastrConfig, {
            closeButton: true,
            progressBar: true,
            showMethod: 'slideDown',
            positionClass: 'toast-bottom-center'
        });

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
                controller: 'accountsLoginTwoFactorController',
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
                    params: { scrollY: 0, searchText: null, syncOnLoad: false }
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
                params: { animation: null, returnScrollY: 0, returnSearchText: null, fromCurrent: false }
            })
            .state('addSite', {
                url: '/add-site',
                templateUrl: 'app/vault/views/vaultAddSite.html',
                controller: 'vaultAddSiteController',
                data: { authorize: true },
                params: {
                    animation: null, returnScrollY: 0, returnSearchText: null, name: null,
                    uri: null, site: null, fromCurrent: false
                }
            })
            .state('editSite', {
                url: '/edit-site?siteId',
                templateUrl: 'app/vault/views/vaultEditSite.html',
                controller: 'vaultEditSiteController',
                data: { authorize: true },
                params: {
                    animation: null, fromView: true, returnScrollY: 0,
                    returnSearchText: null, site: null, fromCurrent: false
                }
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
            })
            .state('sync', {
                url: '/sync',
                templateUrl: 'app/settings/views/settingsSync.html',
                controller: 'settingsSyncController',
                data: { authorize: true },
                params: { animation: null }
            })

            .state('folders', {
                url: '/folders',
                templateUrl: 'app/settings/views/settingsFolders.html',
                controller: 'settingsFoldersController',
                data: { authorize: true },
                params: { animation: null }
            })
            .state('addFolder', {
                url: '/addFolder',
                templateUrl: 'app/settings/views/settingsAddFolder.html',
                controller: 'settingsAddFolderController',
                data: { authorize: true },
                params: { animation: null }
            })
            .state('editFolder', {
                url: '/editFolder?folderId',
                templateUrl: 'app/settings/views/settingsEditFolder.html',
                controller: 'settingsEditFolderController',
                data: { authorize: true },
                params: { animation: null }
            })
            .state('lock', {
                url: '/lock',
                templateUrl: 'app/lock/views/lock.html',
                controller: 'lockController',
                data: { authorize: true },
                params: { animation: null }
            });
    })
    .run(function ($rootScope, userService, loginService, cryptoService, tokenService, $state, constantsService) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            cryptoService.getKey(false, function (key) {
                tokenService.getToken(function (token) {
                    userService.isAuthenticated(function (isAuthenticated) {
                        if (isAuthenticated) {
                            var obj = {};
                            obj[constantsService.lastActiveKey] = (new Date()).getTime();
                            chrome.storage.local.set(obj, function () { });
                        }

                        if (!toState.data || !toState.data.authorize) {
                            if (isAuthenticated && !tokenService.isTokenExpired(token)) {
                                event.preventDefault();
                                if (!key) {
                                    $state.go('lock');
                                }
                                else {
                                    $state.go('tabs.current');
                                }
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
    });
