import {
    APP_INITIALIZER,
    NgModule,
} from '@angular/core';

import { ToasterModule } from 'angular2-toaster';

import { AuthGuardService } from './auth-guard.service';
import { BroadcasterService } from './broadcaster.service';
import { ValidationService } from './validation.service';

function initFactory(): Function {
    return async () => {

    };
}

@NgModule({
    imports: [
        ToasterModule,
    ],
    declarations: [],
    providers: [
        ValidationService,
        AuthGuardService,
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [],
            multi: true,
        },
    ],
})
export class ServicesModule {
}
