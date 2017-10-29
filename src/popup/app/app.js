require('jquery');
require('bootstrap');
require('papaparse');
require('clipboard');

require('angular');

require('angular-animate');
require('angular-ui-router');
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

require('../../models/api/requestModels.js');
require('../../models/api/responseModels.js');
require('../../models/dataModels.js');
require('../../models/domainModels.js');

require('../less/libs.less');
require('../less/popup.less');

import ComponentsModule from './components/components.module';

angular
    .module('bit', [
        'ui.router',
        'ngAnimate',
        'toastr',
        'angulartics',
        'angulartics.google.analytics',

        'bit.directives',
        ComponentsModule,
        'bit.services',

        'bit.global',
        'bit.accounts',
        'bit.current',
        'bit.vault',
        'bit.settings',
        'bit.tools',
        'bit.lock'
    ]);

require('./services/services.module');
require('./config');
require('./directives/directivesModule.js');
require('./directives/formDirective.js');
require('./directives/stopClickDirective.js');
require('./directives/stopPropDirective.js');
require('./directives/fallbackSrcDirective.js');
require('./components/iconComponent.js');
require('./components/actionButtonsComponent.js');
require('./services/backgroundService.js');
require('./services/authService.js');
require('./services/validationService.js');
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
require('./tools/toolsModule.js');
require('./tools/toolsController.js');
require('./tools/toolsPasswordGeneratorController.js');
require('./tools/toolsPasswordGeneratorHistoryController.js');
require('./tools/toolsExportController.js');
require('./lock/lockModule.js');
require('./lock/lockController.js');

// Bootstrap the angular application
angular.element(function() {
    angular.bootstrap(document, ['bit']);
});
