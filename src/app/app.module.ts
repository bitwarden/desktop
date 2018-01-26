import 'core-js';
import 'zone.js/dist/zone';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ServicesModule } from './services/services.module';

import { AddComponent } from './vault/add.component';
import { AppComponent } from './app.component';
import { CiphersComponent } from './vault/ciphers.component';
import { EditComponent } from './vault/edit.component';
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
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        ServicesModule,
        Angulartics2Module.forRoot([Angulartics2GoogleAnalytics], {
            pageTracking: {
                clearQueryParams: true,
            },
        }),
    ],
    declarations: [
        AddComponent,
        AppComponent,
        CiphersComponent,
        EditComponent,
        FallbackSrcDirective,
        GroupingsComponent,
        I18nPipe,
        IconComponent,
        LoginComponent,
        StopClickDirective,
        VaultComponent,
        ViewComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
