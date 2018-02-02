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
import { ApiActionDirective } from './directives/api-action.directive';
import { AppComponent } from './app.component';
import { AttachmentsComponent } from './vault/attachments.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { BlurClickDirective } from './directives/blur-click.directive';
import { BoxRowDirective } from './directives/box-row.directive';
import { CiphersComponent } from './vault/ciphers.component';
import { FallbackSrcDirective } from './directives/fallback-src.directive';
import { FolderAddEditComponent } from './vault/folder-add-edit.component';
import { GroupingsComponent } from './vault/groupings.component';
import { HintComponent } from './accounts/hint.component';
import { I18nPipe } from './pipes/i18n.pipe';
import { IconComponent } from './vault/icon.component';
import { LoginComponent } from './accounts/login.component';
import { ModalComponent } from './modal.component';
import { PasswordGeneratorComponent } from './vault/password-generator.component';
import { RegisterComponent } from './accounts/register.component';
import { SearchCiphersPipe } from './pipes/search-ciphers.pipe';
import { StopClickDirective } from './directives/stop-click.directive';
import { StopPropDirective } from './directives/stop-prop.directive';
import { TwoFactorComponent } from './accounts/two-factor.component';
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
        ApiActionDirective,
        AppComponent,
        AttachmentsComponent,
        AutofocusDirective,
        BlurClickDirective,
        BoxRowDirective,
        CiphersComponent,
        FallbackSrcDirective,
        FolderAddEditComponent,
        GroupingsComponent,
        HintComponent,
        I18nPipe,
        IconComponent,
        LoginComponent,
        ModalComponent,
        PasswordGeneratorComponent,
        RegisterComponent,
        SearchCiphersPipe,
        StopClickDirective,
        StopPropDirective,
        TwoFactorComponent,
        VaultComponent,
        ViewComponent,
        WebviewDirective,
    ],
    entryComponents: [
        AttachmentsComponent,
        FolderAddEditComponent,
        ModalComponent,
        PasswordGeneratorComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
