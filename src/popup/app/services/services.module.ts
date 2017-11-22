import * as angular from 'angular';
import AuthService from './auth.service';
import * as backgroundServices from './background.service';
import StateService from './state.service';
import ValidationService from './validation.service';

export default angular
    .module('bit.services', ['toastr'])
    .service('stateService', StateService)
    .service('validationService', ValidationService)
    .service('authService', AuthService)

    .factory('tokenService', backgroundServices.tokenService)
    .factory('cryptoService', backgroundServices.cryptoService)
    .factory('userService', backgroundServices.userService)
    .factory('apiService', backgroundServices.apiService)
    .factory('folderService', backgroundServices.folderService)
    .factory('cipherService', backgroundServices.cipherService)
    .factory('syncService', backgroundServices.syncService)
    .factory('autofillService', backgroundServices.autofillService)
    .factory('passwordGenerationService', backgroundServices.passwordGenerationService)
    .factory('utilsService', backgroundServices.utilsService)
    .factory('appIdService', backgroundServices.appIdService)
    .factory('i18nService', backgroundServices.i18nService)
    .factory('constantsService', backgroundServices.constantsService)
    .factory('settingsService', backgroundServices.settingsService)
    .factory('lockService', backgroundServices.lockService)
    .factory('totpService', backgroundServices.totpService)
    .factory('environmentService', backgroundServices.environmentService)
    .factory('collectionService', backgroundServices.collectionService)

    .name;
