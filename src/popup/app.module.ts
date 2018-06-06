import 'core-js';
import 'zone.js/dist/zone';

import { ToasterModule } from 'angular2-toaster';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppRoutingModule } from './app-routing.module';
import { ServicesModule } from './services/services.module';

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { EnvironmentComponent } from './accounts/environment.component';
import { HintComponent } from './accounts/hint.component';
import { HomeComponent } from './accounts/home.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RegisterComponent } from './accounts/register.component';
import { TwoFactorOptionsComponent } from './accounts/two-factor-options.component';
import { TwoFactorComponent } from './accounts/two-factor.component';
import { AppComponent } from './app.component';
import { PasswordGeneratorHistoryComponent } from './generator/password-generator-history.component';
import { PasswordGeneratorComponent } from './generator/password-generator.component';
import { PrivateModeComponent } from './private-mode.component';
import { ExportComponent } from './settings/export.component';
import { FolderAddEditComponent } from './settings/folder-add-edit.component';
import { FoldersComponent } from './settings/folders.component';
import { OptionsComponent } from './settings/options.component';
import { PremiumComponent } from './settings/premium.component';
import { SettingsComponent } from './settings/settings.component';
import { SyncComponent } from './settings/sync.component';
import { TabsComponent } from './tabs.component';
import { AddEditComponent } from './vault/add-edit.component';
import { AttachmentsComponent } from './vault/attachments.component';
import { CiphersComponent } from './vault/ciphers.component';
import { CurrentTabComponent } from './vault/current-tab.component';
import { GroupingsComponent } from './vault/groupings.component';
import { ViewComponent } from './vault/view.component';

import { ApiActionDirective } from 'jslib/angular/directives/api-action.directive';
import { AutofocusDirective } from 'jslib/angular/directives/autofocus.directive';
import { BlurClickDirective } from 'jslib/angular/directives/blur-click.directive';
import { BoxRowDirective } from 'jslib/angular/directives/box-row.directive';
import { FallbackSrcDirective } from 'jslib/angular/directives/fallback-src.directive';
import { InputVerbatimDirective } from 'jslib/angular/directives/input-verbatim.directive';
import { StopClickDirective } from 'jslib/angular/directives/stop-click.directive';
import { StopPropDirective } from 'jslib/angular/directives/stop-prop.directive';
import { TrueFalseValueDirective } from 'jslib/angular/directives/true-false-value.directive';

import { I18nPipe } from 'jslib/angular/pipes/i18n.pipe';
import { SearchCiphersPipe } from 'jslib/angular/pipes/search-ciphers.pipe';

import { ActionButtonsComponent } from './components/action-buttons.component';
import { CiphersListComponent } from './components/ciphers-list.component';
import { PopOutComponent } from './components/pop-out.component';

import { IconComponent } from 'jslib/angular/components/icon.component';

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
        InfiniteScrollModule,
    ],
    declarations: [
        ActionButtonsComponent,
        AddEditComponent,
        ApiActionDirective,
        AppComponent,
        AttachmentsComponent,
        AutofocusDirective,
        BlurClickDirective,
        BoxRowDirective,
        CiphersComponent,
        CiphersListComponent,
        CurrentTabComponent,
        EnvironmentComponent,
        ExportComponent,
        FallbackSrcDirective,
        FolderAddEditComponent,
        FoldersComponent,
        GroupingsComponent,
        HomeComponent,
        HintComponent,
        I18nPipe,
        IconComponent,
        InputVerbatimDirective,
        LockComponent,
        LoginComponent,
        OptionsComponent,
        PasswordGeneratorComponent,
        PasswordGeneratorHistoryComponent,
        PopOutComponent,
        PremiumComponent,
        PrivateModeComponent,
        RegisterComponent,
        SearchCiphersPipe,
        SettingsComponent,
        StopClickDirective,
        StopPropDirective,
        SyncComponent,
        TabsComponent,
        TrueFalseValueDirective,
        TwoFactorOptionsComponent,
        TwoFactorComponent,
        ViewComponent,
    ],
    entryComponents: [],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
