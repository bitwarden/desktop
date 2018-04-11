import * as angular from 'angular';

import { BitFormDirective } from './bit-form.directive';
import { FallbackSrcDirective } from './fallback-src.directive';
import { StopClickDirective } from './stop-click.directive';
import { StopPropDirective } from './stop-prop.directive';

export default angular
    .module('bit.directives', [])

    .directive('fallbackSrc', FallbackSrcDirective)
    .directive('stopClick', StopClickDirective)
    .directive('stopProp', StopPropDirective)
    .directive('bitForm', BitFormDirective)

    .name;
