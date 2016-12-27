angular
    .module('bit.current')

    .controller('currentController', function ($scope, siteService, tldjs, toastr, $q, $window, $state, $timeout,
        autofillService, $analytics, i18nService) {
        $scope.i18n = i18nService;

        var pageDetails = [],
            tabId = null,
            url = null,
            domain = null,
            canAutofill = false;

        $scope.sites = [];
        $scope.loaded = false;

        $scope.$on('$viewContentLoaded', function () {
            $timeout(loadVault, 0);
        });

        function loadVault() {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length > 0) {
                    url = tabs[0].url;
                    tabId = tabs[0].id;
                }
                else {
                    $scope.loaded = true;
                    $scope.$apply();
                    return;
                }

                domain = tldjs.getDomain(url);
                if (!domain) {
                    $scope.loaded = true;
                    $scope.$apply();
                    return;
                }

                chrome.tabs.sendMessage(tabId, { command: 'collectPageDetails', tabId: tabId }, function () {
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
            toastr.info(type + i18nService.valueCopied);
            $analytics.eventTrack('Copied ' + (type === i18nService.username ? 'Username' : 'Password'));
        };

        $scope.addSite = function () {
            $state.go('addSite', {
                animation: 'in-slide-up',
                name: domain,
                uri: url,
                from: 'current'
            });
        };

        $scope.fillSite = function (site) {
            var didAutofill = false;

            if (site && canAutofill && pageDetails && pageDetails.length) {
                for (var i = 0; i < pageDetails.length; i++) {
                    if (pageDetails[i].tabId !== tabId) {
                        continue;
                    }

                    var fillScript = autofillService.generateFillScript(pageDetails[i].details, site.username, site.password);
                    if (tabId && fillScript && fillScript.script && fillScript.script.length) {
                        didAutofill = true;
                        $analytics.eventTrack('Autofilled');
                        chrome.tabs.sendMessage(tabId, {
                            command: 'fillForm',
                            fillScript: fillScript
                        }, {
                            frameId: pageDetails[i].frameId
                        }, $window.close);
                    }
                }
            }

            if (!didAutofill) {
                $analytics.eventTrack('Autofilled Error');
                toastr.error(i18nService.autofillError);
            }
        };

        $scope.viewSite = function (site, e) {
            e.stopPropagation();

            $state.go('viewSite', {
                siteId: site.id,
                animation: 'in-slide-up',
                from: 'current'
            });
        };

        $scope.$on('syncCompleted', function (event, successfully) {
            if ($scope.loaded) {
                setTimeout(loadVault, 500);
            }
        });

        $scope.$on('collectPageDetailsResponse', function (event, details) {
            pageDetails.push(details);
        });
    });
