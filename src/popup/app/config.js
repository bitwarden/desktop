angular
    .module('bit')

    .config(function ($stateProvider, $urlRouterProvider, $compileProvider, $sceDelegateProvider, toastrConfig) {
        $compileProvider.imgSrcSanitizationWhitelist(
            /^\s*((https?|ftp|file|blob):|data:image\/|(moz|chrome|ms-browser)-extension)/);

        angular.extend(toastrConfig, {
            closeButton: true,
            progressBar: true,
            showMethod: 'slideDown',
            positionClass: 'toast-bottom-center'
        });

        $urlRouterProvider.otherwise(function ($injector, $location) {
            var $state = $injector.get('$state');

            if (!chrome.extension.getBackgroundPage()) {
                $state.go('privateMode');
                return;
            }

            var userService = $injector.get('userService');
            var cryptoService = $injector.get('cryptoService');

            cryptoService.getKey().then(function (key) {
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
                controller: 'baseController',
                templateUrl: 'app/global/splash.html',
                data: { authorize: false },
                params: { animation: null }
            })
            .state('privateMode', {
                url: '/private-mode',
                controller: 'privateModeController',
                templateUrl: 'app/global/privateMode.html',
                data: { authorize: false },
                params: { animation: null }
            })
            .state('home', {
                url: '/home',
                controller: 'baseController',
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
                params: { animation: null, email: null, masterPassword: null, providers: null, provider: null }
            })
            .state('twoFactorMethods', {
                url: '/two-factor-methods',
                controller: 'accountsTwoFactorMethodsController',
                templateUrl: 'app/accounts/views/accountsTwoFactorMethods.html',
                data: { authorize: false },
                params: { animation: null, email: null, masterPassword: null, providers: null, provider: null }
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
                params: { syncOnLoad: false, searchText: null }
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
            .state('viewCipher', {
                url: '/view-cipher?cipherId',
                templateUrl: 'app/vault/views/vaultViewCipher.html',
                controller: 'vaultViewCipherController',
                data: { authorize: true },
                params: { animation: null, from: 'vault' }
            })
            .state('addCipher', {
                url: '/add-cipher',
                templateUrl: 'app/vault/views/vaultAddCipher.html',
                controller: 'vaultAddCipherController',
                data: { authorize: true },
                params: { animation: null, name: null, uri: null, folderId: null, cipher: null, from: 'vault' }
            })
            .state('editCipher', {
                url: '/edit-cipher?cipherId',
                templateUrl: 'app/vault/views/vaultEditCipher.html',
                controller: 'vaultEditCipherController',
                data: { authorize: true },
                params: { animation: null, fromView: true, cipher: null, from: 'vault' }
            })
            .state('attachments', {
                url: '/attachments?id',
                templateUrl: 'app/vault/views/vaultAttachments.html',
                controller: 'vaultAttachmentsController',
                data: { authorize: true },
                params: { animation: null, fromView: true, from: 'vault' }
            })

            .state('passwordGenerator', {
                url: '/password-generator',
                templateUrl: 'app/tools/views/toolsPasswordGenerator.html',
                controller: 'toolsPasswordGeneratorController',
                data: { authorize: true },
                params: { animation: null, addState: null, editState: null }
            })
            .state('passwordGeneratorHistory', {
                url: '/history',
                templateUrl: 'app/tools/views/toolsPasswordGeneratorHistory.html',
                controller: 'toolsPasswordGeneratorHistoryController',
                data: { authorize: true },
                params: { animation: null, addState: null, editState: null }
            })
            .state('export', {
                url: '/export',
                templateUrl: 'app/tools/views/toolsExport.html',
                controller: 'toolsExportController',
                data: { authorize: true },
                params: { animation: null }
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
            .state('premium', {
                url: '/premium',
                templateUrl: 'app/settings/views/settingsPremium.html',
                controller: 'settingsPremiumController',
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
            .state('environment', {
                url: '/environment',
                templateUrl: 'app/settings/views/settingsEnvironment.html',
                controller: 'settingsEnvironmentController',
                data: { authorize: false },
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
        stateService.init();

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if ($state.current.name.indexOf('tabs.') > -1 && toState.name.indexOf('tabs.') > -1) {
                stateService.removeState('vault');
                stateService.removeState('viewFolder');
            }

            if (!userService) {
                return;
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
