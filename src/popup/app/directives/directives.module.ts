import * as angular from 'angular';

import { FallbackSrcDirective } from './fallback-src.directive';
import { FormDirective } from './form.directive';
import { StopClickDirective } from './stop-click.directive';
import { StopPropDirective } from './stop-prop.directive';

export default angular
    .module('bit.directives', [])

    .directive('fallbackSrc', FallbackSrcDirective)
    .directive('stopClick', StopClickDirective)
    .directive('stopProp', StopPropDirective)
    .directive('form', FormDirective)

    .name;
