import { NgModule } from '@angular/core';

import { InputVerbatimDirective } from 'jslib-angular/directives/input-verbatim.directive';
import { SearchPipe } from 'jslib-angular/pipes/search.pipe';

@NgModule({
    imports: [],
    declarations: [
        InputVerbatimDirective,
        SearchPipe,
    ],
})
export class DummyModule {
}
