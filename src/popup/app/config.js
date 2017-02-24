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
            var userService = $injector.get('userService');
            var cryptoService = $injector.get('cryptoService');

            cryptoService.getKey(false, function (key) {
                userService.isAuthenticated(function (isAuthenticated) {
                    if (isAuthenticated) {
                        if (!key) {
                            $state.go('lock');
                        }
                        else {
                            $state.go('tabs.current');
                        }
                    }
                    else {
                        $state.go('home');
                    }
                });
            });
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
                params: { animation: null, email: null, masterPassword: null }
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
                    params: { syncOnLoad: false }
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

            .state('viewFolder', {
                url: '/view-folder?folderId',
                templateUrl: 'app/vault/views/vaultViewFolder.html',
                controller: 'vaultViewFolderController',
                data: { authorize: true },
                params: { animation: null, from: 'vault' }
            })
            .state('viewLogin', {
                url: '/view-login?loginId',
                templateUrl: 'app/vault/views/vaultViewLogin.html',
                controller: 'vaultViewLoginController',
                data: { authorize: true },
                params: { animation: null, from: 'vault' }
            })
            .state('addLogin', {
                url: '/add-login',
                templateUrl: 'app/vault/views/vaultAddLogin.html',
                controller: 'vaultAddLoginController',
                data: { authorize: true },
                params: { animation: null, name: null, uri: null, folderId: null, login: null, from: 'vault' }
            })
            .state('editLogin', {
                url: '/edit-login?loginId',
                templateUrl: 'app/vault/views/vaultEditLogin.html',
                controller: 'vaultEditLoginController',
                data: { authorize: true },
                params: { animation: null, fromView: true, login: null, from: 'vault' }
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
            .state('credits', {
                url: '/credits',
                templateUrl: 'app/settings/views/settingsCredits.html',
                controller: 'settingsCreditsController',
                data: { authorize: true },
                params: { animation: null }
            })
            .state('features', {
                url: '/features',
                templateUrl: 'app/settings/views/settingsFeatures.html',
                controller: 'settingsFeaturesController',
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
    .run(function ($rootScope, userService, $state, constantsService, stateService) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if ($state.current.name.indexOf('tabs.') > -1 && toState.name.indexOf('tabs.') > -1) {
                stateService.purgeState();
            }

            userService.isAuthenticated(function (isAuthenticated) {
                if (isAuthenticated) {
                    var obj = {};
                    obj[constantsService.lastActiveKey] = (new Date()).getTime();
                    chrome.storage.local.set(obj, function () { });
                }
                else if (toState.data && toState.data.authorize) {
                    event.preventDefault();
                    chrome.runtime.sendMessage({ command: 'logout' });
                }
            });
        });
    });
