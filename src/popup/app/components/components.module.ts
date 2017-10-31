import * as angular from 'angular';
import { CipherItemsComponent } from './cipher-items.component';
import { IconComponent } from './icon.component';

export default angular
    .module('bit.components', [])
    .component('cipherItems', CipherItemsComponent)
    .component('icon', IconComponent)
    .name;
