import * as angular from 'angular';
import { CurrentComponent } from './current.component';

export default angular
    .module('bit.current', ['toastr', 'ngclipboard'])

    .component('current', CurrentComponent)

    .name;
