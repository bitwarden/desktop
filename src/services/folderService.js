function FolderService(cryptoService, userService, apiService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;

    initFolderService();
};

function initFolderService() {
    this.userService.getUserId(function (userId) {
        var foldersKey = 'folders_' + userId;

        FolderService.prototype.get = function (id, callback) {
            if (!callback || typeof callback !== 'function') {
                throw 'callback function required';
            }

            chrome.storage.local.get(foldersKey, function (obj) {
                var folders = obj[foldersKey];
                if (id in folders) {
                    callback(new Folder(folders[id]));
                    return;
                }

                callback(null);
            });
        };

        FolderService.prototype.getAll = function (callback) {
            if (!callback || typeof callback !== 'function') {
                throw 'callback function required';
            }

            chrome.storage.local.get(foldersKey, function (obj) {
                var folders = obj[foldersKey];
                var response = [];
                for (var id in folders) {
                    var folder = folders[id];
                    response.push(new Folder(folder));
                }

                callback(response);
            });
        };

        function handleError() {
            // TODO: check for unauth or forbidden and logout
        }
    });
};
