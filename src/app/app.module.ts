import 'core-js';
import 'zone.js/dist/zone';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ServicesModule } from './services/services.module';
import { ToasterModule } from 'angular2-toaster';

import { AddEditComponent } from './vault/add-edit.component';
import { AppComponent } from './app.component';
import { BlurClickDirective } from './directives/blur-click.directive';
import { CiphersComponent } from './vault/ciphers.component';
import { FallbackSrcDirective } from './directives/fallback-src.directive';
import { GroupingsComponent } from './vault/groupings.component';
import { I18nPipe } from './pipes/i18n.pipe';
import { IconComponent } from './vault/icon.component';
import { LoginComponent } from './accounts/login.component';
import { StopClickDirective } from './directives/stop-click.directive';
import { StopPropDirective } from './directives/stop-prop.directive';
import { VaultComponent } from './vault/vault.component';
import { ViewComponent } from './vault/view.component';

@NgModule({
    imports: [
        BrowserAnimationsModule,
        FormsModule,
        AppRoutingModule,
        ServicesModule,
        Angulartics2Module.forRoot([Angulartics2GoogleAnalytics], {
            pageTracking: {
                clearQueryParams: true,
            },
        }),
        ToasterModule,
    ],
    declarations: [
        AddEditComponent,
        AppComponent,
        BlurClickDirective,
        CiphersComponent,
        FallbackSrcDirective,
        GroupingsComponent,
        I18nPipe,
        IconComponent,
        LoginComponent,
        StopClickDirective,
        StopPropDirective,
        VaultComponent,
        ViewComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
