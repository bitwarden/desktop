angular
    .module('bit.tools')

    .controller('toolsExportController', function ($scope, $state, toastr, $q, $analytics,
        i18nService, cryptoService, userService, folderService, cipherService, $window, constantsService) {
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
            var decFolders = [];
            var decCiphers = [];
            var promises = [];

            var folderPromise = folderService.getAllDecrypted().then(function (folders) {
                decFolders = folders;
            });
            promises.push(folderPromise);

            var ciphersPromise = cipherService.getAllDecrypted().then(function (ciphers) {
                decCiphers = ciphers;
            });
            promises.push(ciphersPromise);

            return $q.all(promises).then(function () {
                var foldersDict = {};
                for (var i = 0; i < decFolders.length; i++) {
                    foldersDict[decFolders[i].id] = decFolders[i];
                }

                var exportCiphers = [];
                for (i = 0; i < decCiphers.length; i++) {
                    // only export logins and secure notes
                    if (decCiphers[i].type !== constantsService.cipherType.login &&
                        decCiphers[i].type !== constantsService.cipherType.secureNote) {
                        continue;
                    }

                    var cipher = {
                        folder: decCiphers[i].folderId && (decCiphers[i].folderId in foldersDict) ?
                            foldersDict[decCiphers[i].folderId].name : null,
                        favorite: decCiphers[i].favorite ? 1 : null,
                        type: null,
                        name: decCiphers[i].name,
                        notes: decCiphers[i].notes,
                        fields: null,
                        // Login props
                        login_uri: null,
                        login_username: null,
                        login_password: null,
                        login_totp: null
                    };

                    if (decCiphers[i].fields) {
                        for (var j = 0; j < decCiphers[i].fields.length; j++) {
                            if (!cipher.fields) {
                                cipher.fields = '';
                            }
                            else {
                                cipher.fields += '\n';
                            }

                            cipher.fields += ((decCiphers[i].fields[j].name || '') + ': ' + decCiphers[i].fields[j].value);
                        }
                    }

                    switch (decCiphers[i].type) {
                        case constantsService.cipherType.login:
                            cipher.type = 'login';
                            cipher.login_uri = decCiphers[i].login.uri;
                            cipher.login_username = decCiphers[i].login.username;
                            cipher.login_password = decCiphers[i].login.password;
                            cipher.login_totp = decCiphers[i].login.totp;
                            break;
                        case constantsService.cipherType.secureNote:
                            cipher.type = 'note';
                            break;
                        default:
                            continue;
                    }

                    exportCiphers.push(cipher);
                }

                var csv = Papa.unparse(exportCiphers);
                return csv;
            });
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
