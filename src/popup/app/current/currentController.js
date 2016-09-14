angular
    .module('bit.current')

    .controller('currentController', function ($scope, siteService, cipherService, tldjs, toastr, $q) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var url = null;
            var id = null;
            if (tabs.length > 0) {
                url = tabs[0].url
                id = tabs[0].id
            }

            var domain = tldjs.getDomain(url);
            $scope.sites = [];
            if (!domain) {
                return;
            }

            chrome.tabs.sendMessage(id, { text: 'collectFormData' }, function (formData) {
                var filteredPromises = [],
                filteredSites = [],
                promises = [],
                decSites = [];

                siteService.getAll(function (sites) {
                    for (var i = 0; i < sites.length; i++) {
                        var uriPromise = cipherService.decrypt(sites[i].uri, i);
                        filteredPromises.push(uriPromise);
                        uriPromise.then(function (obj) {
                            if (!obj.val) {
                                return;
                            }

                            var siteDomain = tldjs.getDomain(obj.val);
                            if (!siteDomain || siteDomain != domain) {
                                return;
                            }

                            filteredSites.push(obj.index);
                        });
                    }

                    $q.all(filteredPromises).then(function () {
                        for (var j = 0; j < filteredSites.length; j++) {
                            var index = filteredSites[j];
                            decSites.push({
                                id: sites[index].id,
                                folderId: sites[index].folderId,
                                favorite: sites[index].favorite
                            });

                            var namePromise = cipherService.decrypt(sites[index].name, j);
                            promises.push(namePromise);
                            namePromise.then(function (obj) {
                                decSites[obj.index].name = obj.val;
                            });

                            var usernamePromise = cipherService.decrypt(sites[index].username, j);
                            promises.push(usernamePromise);
                            usernamePromise.then(function (obj) {
                                decSites[obj.index].username = obj.val;
                            });

                            var passwordPromise = cipherService.decrypt(sites[index].password, j);
                            promises.push(passwordPromise);
                            passwordPromise.then(function (obj) {
                                decSites[obj.index].password = obj.val;
                            });
                        }

                        $q.all(promises).then(function () {
                            $scope.sites = decSites;
                        });
                    });
                });
            });
        });
    });
