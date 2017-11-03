require('jquery');
require('bootstrap');
require('papaparse');
require('clipboard');

require('angular');

require('angular-animate');
const uiRouter = require('@uirouter/angularjs').default;
require('angular-toastr');

require('ngclipboard');

require('sweetalert');
require('angular-sweetalert');
require('angulartics');
require('angulartics-google-analytics');
require('ng-infinite-scroll');

require('../../scripts/analytics.js');
require('../../scripts/duo.js');
require('../../scripts/u2f.js');

require('../../models/domainModels.js');

require('../less/libs.less');
require('../less/popup.less');

import ComponentsModule from './components/components.module';
import ToolsModule from './tools/tools.module';
import ServicesModule from './services/services.module';
import LockModule from './lock/lock.module';

// Model imports
import { AttachmentData } from '../../models/data/attachmentData';
import { CardData } from '../../models/data/cardData';
import { CipherData } from '../../models/data/cipherData';
import { FieldData } from '../../models/data/fieldData';
import { FolderData } from '../../models/data/folderData';
import { IdentityData } from '../../models/data/identityData';
import { LoginData } from '../../models/data/loginData';
import { SecureNoteData } from '../../models/data/secureNoteData';

import { CipherString } from '../../models/domain/cipherString';

import { CipherRequest } from '../../models/request/cipherRequest';
import { DeviceRequest } from '../../models/request/deviceRequest';
import { DeviceTokenRequest } from '../../models/request/deviceTokenRequest';
import { FolderRequest } from '../../models/request/folderRequest';
import { PasswordHintRequest } from '../../models/request/passwordHintRequest';
import { RegisterRequest } from '../../models/request/registerRequest';
import { TokenRequest } from '../../models/request/tokenRequest';
import { TwoFactorEmailRequest } from '../../models/request/twoFactorEmailRequest';

import { AttachmentResponse } from '../../models/response/attachmentResponse';
import { CipherResponse } from '../../models/response/cipherResponse';
import { DeviceResponse } from '../../models/response/deviceResponse';
import { DomainsResponse } from '../../models/response/domainsResponse';
import { ErrorResponse } from '../../models/response/errorResponse';
import { FolderResponse } from '../../models/response/folderResponse';
import { GlobalDomainResponse } from '../../models/response/globalDomainResponse';
import { IdentityTokenResponse } from '../../models/response/identityTokenResponse';
import { KeysResponse } from '../../models/response/keysResponse';
import { ListResponse } from '../../models/response/listResponse';
import { ProfileOrganizationResponse } from '../../models/response/profileOrganizationResponse';
import { ProfileResponse } from '../../models/response/profileResponse';
import { SyncResponse } from '../../models/response/syncResponse';

angular
    .module('bit', [
        uiRouter,
        'ngAnimate',
        'toastr',
        'angulartics',
        'angulartics.google.analytics',

        'bit.directives',
        ComponentsModule,
        ServicesModule,

        'bit.global',
        'bit.accounts',
        'bit.current',
        'bit.vault',
        'bit.settings',
        ToolsModule,
        LockModule
    ]);

require('./config');
require('./directives/directivesModule.js');
require('./directives/formDirective.js');
require('./directives/stopClickDirective.js');
require('./directives/stopPropDirective.js');
require('./directives/fallbackSrcDirective.js');
require('./global/globalModule.js');
require('./global/mainController.js');
require('./global/tabsController.js');
require('./global/baseController.js');
require('./global/privateModeController.js');
require('./accounts/accountsModule.js');
require('./accounts/accountsLoginController.js');
require('./accounts/accountsLoginTwoFactorController.js');
require('./accounts/accountsTwoFactorMethodsController.js');
require('./accounts/accountsHintController.js');
require('./accounts/accountsRegisterController.js');
require('./current/currentModule.js');
require('./current/currentController.js');
require('./vault/vaultModule.js');
require('./vault/vaultController.js');
require('./vault/vaultViewFolderController.js');
require('./vault/vaultAddCipherController.js');
require('./vault/vaultEditCipherController.js');
require('./vault/vaultViewCipherController.js');
require('./vault/vaultAttachmentsController.js');
require('./settings/settingsModule.js');
require('./settings/settingsController.js');
require('./settings/settingsHelpController.js');
require('./settings/settingsAboutController.js');
require('./settings/settingsCreditsController.js');
require('./settings/settingsFeaturesController.js');
require('./settings/settingsSyncController.js');
require('./settings/settingsFoldersController.js');
require('./settings/settingsAddFolderController.js');
require('./settings/settingsEditFolderController.js');
require('./settings/settingsPremiumController.js');
require('./settings/settingsEnvironmentController.js');
require('./tools/toolsPasswordGeneratorController.js');
require('./tools/toolsPasswordGeneratorHistoryController.js');
require('./tools/toolsExportController.js');

// Bootstrap the angular application
angular.element(function () {
    angular.bootstrap(document, ['bit']);
});
