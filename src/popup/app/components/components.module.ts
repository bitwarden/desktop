import * as angular from 'angular';
import { ActionButtonsComponent } from './action-buttons.component';
import { CipherItemsComponent } from './cipher-items.component';
import { IconComponent } from './icon.component';

export default angular
    .module('bit.components', [])
    .component('cipherItems', CipherItemsComponent)
    .component('icon', IconComponent)
    .component('actionButtons', ActionButtonsComponent)
    .name;
