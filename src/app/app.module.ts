import 'core-js';
import 'zone.js/dist/zone';

import { ToasterModule } from 'angular2-toaster';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { AppRoutingModule } from './app-routing.module';
import { ServicesModule } from './services/services.module';

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { ModalComponent } from './modal.component';

import { EnvironmentComponent } from './accounts/environment.component';
import { HintComponent } from './accounts/hint.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { PremiumComponent } from './accounts/premium.component';
import { RegisterComponent } from './accounts/register.component';
import { SettingsComponent } from './accounts/settings.component';
import { TwoFactorOptionsComponent } from './accounts/two-factor-options.component';
import { TwoFactorComponent } from './accounts/two-factor.component';

import { ApiActionDirective } from 'jslib/angular/directives/api-action.directive';
import { AutofocusDirective } from 'jslib/angular/directives/autofocus.directive';
import { BlurClickDirective } from 'jslib/angular/directives/blur-click.directive';
import { BoxRowDirective } from 'jslib/angular/directives/box-row.directive';
import { FallbackSrcDirective } from 'jslib/angular/directives/fallback-src.directive';
import { StopClickDirective } from 'jslib/angular/directives/stop-click.directive';
import { StopPropDirective } from 'jslib/angular/directives/stop-prop.directive';

import { I18nPipe } from 'jslib/angular/pipes/i18n.pipe';
import { SearchCiphersPipe } from './pipes/search-ciphers.pipe';

import { AddEditComponent } from './vault/add-edit.component';
import { AttachmentsComponent } from './vault/attachments.component';
import { CiphersComponent } from './vault/ciphers.component';
import { FolderAddEditComponent } from './vault/folder-add-edit.component';
import { GroupingsComponent } from './vault/groupings.component';
import { IconComponent } from 'jslib/angular/components/icon.component';
import { PasswordGeneratorHistoryComponent } from './vault/password-generator-history.component';
import { PasswordGeneratorComponent } from './vault/password-generator.component';
import { VaultComponent } from './vault/vault.component';
import { ViewComponent } from './vault/view.component';

@NgModule({
    imports: [
        BrowserModule,
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
        ApiActionDirective,
        AppComponent,
        AttachmentsComponent,
        AutofocusDirective,
        BlurClickDirective,
        BoxRowDirective,
        CiphersComponent,
        EnvironmentComponent,
        FallbackSrcDirective,
        FolderAddEditComponent,
        GroupingsComponent,
        HintComponent,
        I18nPipe,
        IconComponent,
        LockComponent,
        LoginComponent,
        ModalComponent,
        PasswordGeneratorComponent,
        PasswordGeneratorHistoryComponent,
        PremiumComponent,
        RegisterComponent,
        SearchCiphersPipe,
        SettingsComponent,
        StopClickDirective,
        StopPropDirective,
        TwoFactorComponent,
        TwoFactorOptionsComponent,
        VaultComponent,
        ViewComponent,
    ],
    entryComponents: [
        AttachmentsComponent,
        EnvironmentComponent,
        FolderAddEditComponent,
        ModalComponent,
        PasswordGeneratorComponent,
        PasswordGeneratorHistoryComponent,
        PremiumComponent,
        SettingsComponent,
        TwoFactorOptionsComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
