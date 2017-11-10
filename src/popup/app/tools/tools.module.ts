import * as angular from 'angular';
import { PasswordGeneratorComponent } from './password-generator.component';
import { ToolsComponent } from './tools.component';

export default angular
    .module('bit.tools', ['ngAnimate', 'ngclipboard', 'toastr', 'oitozero.ngSweetAlert'])

    .component('tools', ToolsComponent)
    .component('passwordGenerator', PasswordGeneratorComponent)

    .name;
