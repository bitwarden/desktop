angular
    .module('bit.current')

    .controller('currentController', function ($scope, siteService, tldjs, toastr, $q, $window, $state, autofillService) {
        var pageDetails = null,
            tabId = null,
            url = null,
            domain = null,
            canAutofill = false;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                url = tabs[0].url;
                tabId = tabs[0].id;
            }
            else {
                return;
            }

            domain = tldjs.getDomain(url);
            $scope.sites = [];
            if (!domain) {
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

                $scope.sites = filteredSites;
            });
        });

        $scope.clipboardError = function (e, password) {
            toastr.info('Your web browser does not support easy clipboard copying. Copy it manually instead.');
        };

        $scope.clipboardSuccess = function (e, type) {
            e.clearSelection();
            toastr.info(type + ' copied!');
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

            if (tabId && fillScript) {
                chrome.tabs.sendMessage(tabId, {
                    command: 'fillForm',
                    fillScript: fillScript
                }, function () {
                    $window.close();
                });
            }
            else {
                toastr.error('Unable to auto-fill the selected site. Copy/paste your username and/or password instead.');
            }
        };
    });
