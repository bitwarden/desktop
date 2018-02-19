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

require('../../scripts/duo.js');

require('../less/libs.less');
require('../less/popup.less');

import DirectivesModule from './directives/directives.module';
import ComponentsModule from './components/components.module';
import ToolsModule from './tools/tools.module';
import ServicesModule from './services/services.module';
import LockModule from './lock/lock.module';
import CurrentModule from './current/current.module';
import GlobalModule from './global/global.module';
import SettingsModule from './settings/settings.module';

import { BrowserApi } from '../../browser/browserApi';
window.BrowserApi = BrowserApi;
import { U2f } from '../../scripts/u2f';
window.U2f = U2f;

import { Analytics } from '../../../jslib/src/misc/analytics';
new Analytics(window, () => BrowserApi.gaFilter(), null, null, null, () => {
    const bgPage = BrowserApi.getBackgroundPage();
    if (!bgPage || !bgPage.bitwardenMain) {
        throw 'Cannot resolve background page main.';
    }
    return bgPage.bitwardenMain;
});

// Model imports
import { Attachment } from '../../../jslib/src/models/domain/attachment';
import { Card } from '../../../jslib/src/models/domain/card';
import { Cipher } from '../../../jslib/src/models/domain/cipher';
import { CipherString } from '../../../jslib/src/models/domain/cipherString';
import { Field } from '../../../jslib/src/models/domain/field';
import { Folder } from '../../../jslib/src/models/domain/folder';
import { Identity } from '../../../jslib/src/models/domain/identity';
import { Login } from '../../../jslib/src/models/domain/login';
import { SecureNote } from '../../../jslib/src/models/domain/secureNote';
window.Attachment = Attachment;
window.Card = Card;
window.Cipher = Cipher;
window.CipherString = CipherString;
window.Field = Field;
window.Folder = Folder;
window.Identity = Identity;
window.Login = Login;
window.SecureNote = SecureNote;

import { AttachmentData } from '../../../jslib/src/models/data/attachmentData';
import { CardData } from '../../../jslib/src/models/data/cardData';
import { CipherData } from '../../../jslib/src/models/data/cipherData';
import { CollectionData } from '../../../jslib/src/models/data/collectionData';
import { FieldData } from '../../../jslib/src/models/data/fieldData';
import { FolderData } from '../../../jslib/src/models/data/folderData';
import { IdentityData } from '../../../jslib/src/models/data/identityData';
import { LoginData } from '../../../jslib/src/models/data/loginData';
import { SecureNoteData } from '../../../jslib/src/models/data/secureNoteData';
window.AttachmentData = AttachmentData;
window.CardData = CardData;
window.CipherData = CipherData;
window.CollectionData = CollectionData;
window.FieldData = FieldData;
window.FolderData = FolderData;
window.IdentityData = IdentityData;
window.LoginData = LoginData;
window.SecureNoteData = SecureNoteData;

import { CipherRequest } from '../../../jslib/src/models/request/cipherRequest';
import { DeviceRequest } from '../../../jslib/src/models/request/deviceRequest';
import { DeviceTokenRequest } from '../../../jslib/src/models/request/deviceTokenRequest';
import { FolderRequest } from '../../../jslib/src/models/request/folderRequest';
import { PasswordHintRequest } from '../../../jslib/src/models/request/passwordHintRequest';
import { RegisterRequest } from '../../../jslib/src/models/request/registerRequest';
import { TokenRequest } from '../../../jslib/src/models/request/tokenRequest';
import { TwoFactorEmailRequest } from '../../../jslib/src/models/request/twoFactorEmailRequest';
window.CipherRequest = CipherRequest;
window.DeviceRequest = DeviceRequest;
window.DeviceTokenRequest = DeviceTokenRequest;
window.FolderRequest = FolderRequest;
window.PasswordHintRequest = PasswordHintRequest;
window.RegisterRequest = RegisterRequest;
window.TokenRequest = TokenRequest;
window.TwoFactorEmailRequest = TwoFactorEmailRequest;

import { AttachmentResponse } from '../../../jslib/src/models/response/attachmentResponse';
import { CipherResponse } from '../../../jslib/src/models/response/cipherResponse';
import { CollectionResponse } from '../../../jslib/src/models/response/collectionResponse';
import { DeviceResponse } from '../../../jslib/src/models/response/deviceResponse';
import { DomainsResponse } from '../../../jslib/src/models/response/domainsResponse';
import { ErrorResponse } from '../../../jslib/src/models/response/errorResponse';
import { FolderResponse } from '../../../jslib/src/models/response/folderResponse';
import { GlobalDomainResponse } from '../../../jslib/src/models/response/globalDomainResponse';
import { IdentityTokenResponse } from '../../../jslib/src/models/response/identityTokenResponse';
import { KeysResponse } from '../../../jslib/src/models/response/keysResponse';
import { ListResponse } from '../../../jslib/src/models/response/listResponse';
import { ProfileOrganizationResponse } from '../../../jslib/src/models/response/profileOrganizationResponse';
import { ProfileResponse } from '../../../jslib/src/models/response/profileResponse';
import { SyncResponse } from '../../../jslib/src/models/response/syncResponse';
window.AttachmentResponse = AttachmentResponse;
window.CipherResponse = CipherResponse;
window.CollectionResponse = CollectionResponse;
window.DeviceResponse = DeviceResponse;
window.DomainsResponse = DomainsResponse;
window.ErrorResponse = ErrorResponse;
window.FolderResponse = FolderResponse;
window.GlobalDomainResponse = GlobalDomainResponse;
window.IdentityTokenResponse = IdentityTokenResponse;
window.KeysResponse = KeysResponse;
window.ListResponse = ListResponse;
window.ProfileOrganizationResponse = ProfileOrganizationResponse;
window.ProfileResponse = ProfileResponse;
window.SyncResponse = SyncResponse;

angular
    .module('bit', [
        uiRouter,
        'ngAnimate',
        'toastr',
        'angulartics',
        'angulartics.google.analytics',

        DirectivesModule,
        ComponentsModule,
        ServicesModule,

        GlobalModule,
        'bit.accounts',
        CurrentModule,
        'bit.vault',
        SettingsModule,
        ToolsModule,
        LockModule
    ]);

require('./config');
require('./accounts/accountsModule.js');
require('./accounts/accountsLoginController.js');
require('./accounts/accountsLoginTwoFactorController.js');
require('./accounts/accountsTwoFactorMethodsController.js');
require('./accounts/accountsHintController.js');
require('./accounts/accountsRegisterController.js');
require('./vault/vaultModule.js');
require('./vault/vaultController.js');
require('./vault/vaultViewGroupingController.js');
require('./vault/vaultAddCipherController.js');
require('./vault/vaultEditCipherController.js');
require('./vault/vaultViewCipherController.js');
require('./vault/vaultAttachmentsController.js');

// $$ngIsClass fix issue with "class constructors must be invoked with |new|" on Firefox ESR
// ref: https://github.com/angular/angular.js/issues/14240
import { ActionButtonsController } from './components/action-buttons.component';
ActionButtonsController.$$ngIsClass = true;
import { CipherItemsController } from './components/cipher-items.component';
CipherItemsController.$$ngIsClass = true;
import { IconController } from './components/icon.component';
IconController.$$ngIsClass = true;
import { PopOutController } from './components/pop-out.component';
PopOutController.$$ngIsClass = true;
import { CurrentController } from './current/current.component';
CurrentController.$$ngIsClass = true;
import { LockController } from './lock/lock.component';
LockController.$$ngIsClass = true;
import { ExportController } from './tools/export.component';
ExportController.$$ngIsClass = true;
import { PasswordGeneratorController } from './tools/password-generator.component';
PasswordGeneratorController.$$ngIsClass = true;
import { PasswordGeneratorHistoryController } from './tools/password-generator-history.component';
PasswordGeneratorHistoryController.$$ngIsClass = true;
import { ToolsController } from './tools/tools.component';
ToolsController.$$ngIsClass = true;
import { AddFolderController } from './settings/folders/add-folder.component';
AddFolderController.$$ngIsClass = true;
import { EditFolderController } from './settings/folders/edit-folder.component';
EditFolderController.$$ngIsClass = true;
import { FoldersController } from './settings/folders/folders.component';
FoldersController.$$ngIsClass = true;
import { AboutController } from './settings/about.component';
AboutController.$$ngIsClass = true;
import { CreditsController } from './settings/credits.component';
CreditsController.$$ngIsClass = true;
import { EnvironmentController } from './settings/environment.component';
EnvironmentController.$$ngIsClass = true;
import { OptionsController } from './settings/options.component';
OptionsController.$$ngIsClass = true;
import { HelpController } from './settings/help.component';
HelpController.$$ngIsClass = true;
import { PremiumController } from './settings/premium.component';
PremiumController.$$ngIsClass = true;
import { SettingsController } from './settings/settings.component';
SettingsController.$$ngIsClass = true;
import { SyncController } from './settings/sync.component';
SyncController.$$ngIsClass = true;
import { BaseController } from './global/base.controller';
BaseController.$$ngIsClass = true;
import { MainController } from './global/main.controller';
MainController.$$ngIsClass = true;
import { PrivateModeController } from './global/private-mode.controller';
PrivateModeController.$$ngIsClass = true;
import { TabsController } from './global/tabs.controller';
TabsController.$$ngIsClass = true;

// Bootstrap the angular application
angular.element(function () {
    angular.bootstrap(document, ['bit']);
});
