import * as angular from 'angular';
import { BaseController } from './base.controller';
import { MainController } from './main.controller';
import { PrivateModeController } from './private-mode.controller';
import { TabsController } from './tabs.controller';

export default angular
    .module('bit.global', ['ngAnimate'])

    .controller('mainController', MainController)
    .controller('baseController', BaseController)
    .controller('tabsController', TabsController)
    .controller('privateModeController', PrivateModeController)

    .name;
