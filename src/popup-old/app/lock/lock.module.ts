import * as angular from 'angular';
import { LockComponent } from './lock.component';

export default angular
    .module('bit.lock', ['ngAnimate', 'toastr'])

    .component('lock', LockComponent)

    .name;
