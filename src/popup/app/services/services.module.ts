import * as angular from 'angular';
import * as backgroundServices from './background.service';
import { PopupUtilsService } from './popupUtils.service';
import { StateService } from './state.service';
import { ValidationService } from './validation.service';

import { AuditService } from 'jslib/services/audit.service';
import { AuthService } from 'jslib/services/auth.service';

import BrowserMessagingService from '../../../services/browserMessaging.service';

const messagingService = new BrowserMessagingService(backgroundServices.platformUtilsService());
const authService = new AuthService(backgroundServices.cryptoService(), backgroundServices.apiService(),
    backgroundServices.userService(), backgroundServices.tokenService(), backgroundServices.appIdService(),
    backgroundServices.i18n2Service(), backgroundServices.platformUtilsService(),
    backgroundServices.constantsService(), messagingService);
authService.init();

export default angular
    .module('bit.services', ['toastr'])
    .service('stateService', StateService)
    .service('validationService', ValidationService)
    .service('popupUtilsService', PopupUtilsService)

    .factory('authService', () => authService)
    .factory('messagingService', () => messagingService)
    .factory('storageService', backgroundServices.storageService)
    .factory('tokenService', backgroundServices.tokenService)
    .factory('cryptoService', backgroundServices.cryptoService)
    .factory('userService', backgroundServices.userService)
    .factory('apiService', backgroundServices.apiService)
    .factory('folderService', backgroundServices.folderService)
    .factory('cipherService', backgroundServices.cipherService)
    .factory('syncService', backgroundServices.syncService)
    .factory('autofillService', backgroundServices.autofillService)
    .factory('passwordGenerationService', backgroundServices.passwordGenerationService)
    .factory('platformUtilsService', backgroundServices.platformUtilsService)
    .factory('utilsService', backgroundServices.utilsService)
    .factory('appIdService', backgroundServices.appIdService)
    .factory('i18nService', backgroundServices.i18nService)
    .factory('constantsService', backgroundServices.constantsService)
    .factory('settingsService', backgroundServices.settingsService)
    .factory('lockService', backgroundServices.lockService)
    .factory('totpService', backgroundServices.totpService)
    .factory('environmentService', backgroundServices.environmentService)
    .factory('collectionService', backgroundServices.collectionService)
    .factory('auditService', AuditService)

    .name;
