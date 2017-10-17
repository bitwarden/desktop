angular
    .module('bit.tools')

    .controller('toolsExportController', function ($scope, $state, toastr, $q, $analytics,
        i18nService, cryptoService, userService, folderService, cipherService, $window) {
        $scope.i18n = i18nService;

        $('#master-password').focus();

        $scope.submitPromise = null;
        $scope.submit = function () {
            $scope.submitPromise = checkPassword().then(function () {
                return getCsv();
            }).then(function (csv) {
                $analytics.eventTrack('Exported Data');
                downloadFile(csv);
            }, function () {
                toastr.error(i18nService.invalidMasterPassword, i18nService.errorsOccurred);
            });
        };

        function checkPassword() {
            var deferred = $q.defer();

            userService.getEmail(function (email) {
                var key = cryptoService.makeKey($scope.masterPassword, email);
                cryptoService.hashPassword($scope.masterPassword, key, function (keyHash) {
                    cryptoService.getKeyHash(function (storedKeyHash) {
                        if (storedKeyHash && keyHash && storedKeyHash === keyHash) {
                            deferred.resolve();
                        }
                        else {
                            deferred.reject();
                        }
                    });
                });
            });

            return deferred.promise;
        }

        function getCsv() {
            var deferred = $q.defer();
            var decFolders = [];
            var decLogins = [];
            var promises = [];

            var folderPromise = folderService.getAllDecrypted().then(function (folders) {
                decFolders = folders;
            });
            promises.push(folderPromise);

            var loginPromise = cipherService.getAllDecrypted().then(function (logins) {
                decLogins = logins;
            });
            promises.push(loginPromise);

            $q.all(promises).then(function () {
                var exportLogins = [];
                for (var i = 0; i < decLogins.length; i++) {
                    var login = {
                        name: decLogins[i].name,
                        uri: decLogins[i].uri,
                        username: decLogins[i].username,
                        password: decLogins[i].password,
                        notes: decLogins[i].notes,
                        folder: null,
                        totp: decLogins[i].totp,
                        fields: null
                    };

                    var j;

                    if (decLogins[i].fields) {
                        for (j = 0; j < decLogins[i].fields.length; j++) {
                            if (!login.fields) {
                                login.fields = '';
                            }
                            else {
                                login.fields += '\n';
                            }

                            login.fields += (decLogins[i].fields[j].name + ': ' + decLogins[i].fields[j].value);
                        }
                    }

                    for (j = 0; j < decFolders.length; j++) {
                        if (decFolders[j].id === decLogins[i].folderId && decFolders[j].name !== i18nService.noneFolder) {
                            login.folder = decFolders[j].name;
                            break;
                        }
                    }

                    exportLogins.push(login);
                }

                var csv = Papa.unparse(exportLogins);
                deferred.resolve(csv);
            });

            return deferred.promise;
        }

        function downloadFile(csvString) {
            var csvBlob = new Blob([csvString]);
            var fileName = makeFileName();

            if ($window.navigator.msSaveOrOpenBlob) {
                // Currently bugged in Edge. See
                // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8178877/
                // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8477778/
                $window.navigator.msSaveBlob(csvBlob, fileName);
            }
            else {
                var a = $window.document.createElement('a');
                a.href = $window.URL.createObjectURL(csvBlob, { type: 'text/plain' });
                a.download = fileName;
                $window.document.body.appendChild(a);
                a.click();
                $window.document.body.removeChild(a);
            }
        }

        function makeFileName() {
            var now = new Date();
            var dateString =
                now.getFullYear() + '' + padNumber(now.getMonth() + 1, 2) + '' + padNumber(now.getDate(), 2) +
                padNumber(now.getHours(), 2) + '' + padNumber(now.getMinutes(), 2) +
                padNumber(now.getSeconds(), 2);

            return 'bitwarden_export_' + dateString + '.csv';
        }

        function padNumber(number, width, paddingCharacter) {
            paddingCharacter = paddingCharacter || '0';
            number = number + '';
            return number.length >= width ? number : new Array(width - number.length + 1).join(paddingCharacter) + number;
        }
    });
