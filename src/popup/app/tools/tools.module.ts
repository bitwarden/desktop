import * as angular from 'angular';
import { ToolsComponent } from './tools.component';

export default angular
    .module('bit.tools', ['ngAnimate', 'ngclipboard', 'toastr', 'oitozero.ngSweetAlert'])
    .component('tools', ToolsComponent) 
    .name;
