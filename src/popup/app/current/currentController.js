angular
    .module('bit.current')

    .controller('currentController', function ($scope, siteService, tldjs, toastr, $q, $window, $state, autofillService,
        $analytics, i18nService) {
        $scope.i18n = i18nService;

        var pageDetails = null,
            tabId = null,
            url = null,
            domain = null,
            canAutofill = false;

        $scope.loaded = false;

        loadVault();
        function loadVault() {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length > 0) {
                    url = tabs[0].url;
                    tabId = tabs[0].id;
                }
                else {
                    $scope.loaded = true;
                    return;
                }

                domain = tldjs.getDomain(url);
                $scope.sites = [];
                if (!domain) {
                    $scope.loaded = true;
                    return;
                }

                chrome.tabs.sendMessage(tabId, { command: 'collectPageDetails' }, function (details) {
                    pageDetails = details;
                    canAutofill = true;
                });

                var filteredSites = [];
                var sitePromise = $q.when(siteService.getAllDecrypted());
                sitePromise.then(function (sites) {
                    for (var i = 0; i < sites.length; i++) {
                        if (sites[i].domain && sites[i].domain === domain) {
                            filteredSites.push(sites[i]);
                        }
                    }

                    $scope.loaded = true;
                    $scope.sites = filteredSites;
                });
            });
        }

        $scope.clipboardError = function (e, password) {
            toastr.info(i18n.browserNotSupportClipboard);
        };

        $scope.clipboardSuccess = function (e, type) {
            e.clearSelection();
            toastr.info(type + ' copied!');
            $analytics.eventTrack('Copied ' + type);
        };

        $scope.addSite = function () {
            $state.go('addSite', {
                animation: 'in-slide-up',
                name: domain,
                uri: url
            });
        };

        $scope.fillSite = function (site) {
            var fillScript = null;
            if (site && canAutofill && pageDetails) {
                fillScript = autofillService.generateFillScript(pageDetails, site.username, site.password);
            }

            if (tabId && fillScript && fillScript.script && fillScript.script.length) {
                $analytics.eventTrack('Autofilled');
                chrome.tabs.sendMessage(tabId, {
                    command: 'fillForm',
                    fillScript: fillScript
                }, function () {
                    $window.close();
                });
            }
            else {
                $analytics.eventTrack('Autofilled Error');
                toastr.error('Unable to auto-fill the selected site on this page. ' +
                    'Copy/paste your username and/or password instead.');
            }
        };

        $scope.$on('syncCompleted', function (event, successfully) {
            if ($scope.loaded) {
                setTimeout(loadVault, 500);
            }
        });
    });
