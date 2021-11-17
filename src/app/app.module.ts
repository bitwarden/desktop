import 'zone.js/dist/zone';

import { ToasterModule } from 'angular2-toaster';

import { AppRoutingModule } from './app-routing.module';
import { ServicesModule } from './services.module';

import { A11yModule } from '@angular/cdk/a11y';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { EnvironmentComponent } from './accounts/environment.component';
import { HintComponent } from './accounts/hint.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { PremiumComponent } from './accounts/premium.component';
import { RegisterComponent } from './accounts/register.component';
import { RemovePasswordComponent } from './accounts/remove-password.component';
import { SetPasswordComponent } from './accounts/set-password.component';
import { SettingsComponent } from './accounts/settings.component';
import { SsoComponent } from './accounts/sso.component';
import { TwoFactorOptionsComponent } from './accounts/two-factor-options.component';
import { TwoFactorComponent } from './accounts/two-factor.component';
import { UpdateTempPasswordComponent } from './accounts/update-temp-password.component';
import { VaultTimeoutInputComponent } from './accounts/vault-timeout-input.component';

import { CalloutComponent } from 'jslib-angular/components/callout.component';
import { IconComponent } from 'jslib-angular/components/icon.component';

import { A11yTitleDirective } from 'jslib-angular/directives/a11y-title.directive';
import { ApiActionDirective } from 'jslib-angular/directives/api-action.directive';
import { AutofocusDirective } from 'jslib-angular/directives/autofocus.directive';
import { BlurClickDirective } from 'jslib-angular/directives/blur-click.directive';
import { BoxRowDirective } from 'jslib-angular/directives/box-row.directive';
import { CipherListVirtualScroll } from 'jslib-angular/directives/cipherListVirtualScroll.directive';
import { FallbackSrcDirective } from 'jslib-angular/directives/fallback-src.directive';
import { SelectCopyDirective } from 'jslib-angular/directives/select-copy.directive';
import { StopClickDirective } from 'jslib-angular/directives/stop-click.directive';
import { StopPropDirective } from 'jslib-angular/directives/stop-prop.directive';
import { TrueFalseValueDirective } from 'jslib-angular/directives/true-false-value.directive';

import { ColorPasswordPipe } from 'jslib-angular/pipes/color-password.pipe';
import { I18nPipe } from 'jslib-angular/pipes/i18n.pipe';
import { SearchCiphersPipe } from 'jslib-angular/pipes/search-ciphers.pipe';

import { AddEditCustomFieldsComponent } from './vault/add-edit-custom-fields.component';
import { AddEditComponent } from './vault/add-edit.component';
import { AttachmentsComponent } from './vault/attachments.component';
import { CiphersComponent } from './vault/ciphers.component';
import { CollectionsComponent } from './vault/collections.component';
import { ExportComponent } from './vault/export.component';
import { FolderAddEditComponent } from './vault/folder-add-edit.component';
import { GroupingsComponent } from './vault/groupings.component';
import { PasswordGeneratorHistoryComponent } from './vault/password-generator-history.component';
import { PasswordGeneratorComponent } from './vault/password-generator.component';
import { PasswordHistoryComponent } from './vault/password-history.component';
import { ShareComponent } from './vault/share.component';
import { VaultComponent } from './vault/vault.component';
import { ViewCustomFieldsComponent } from './vault/view-custom-fields.component';
import { ViewComponent } from './vault/view.component';

import { AddEditComponent as SendAddEditComponent } from './send/add-edit.component';
import { EffluxDatesComponent as SendEffluxDatesComponent } from './send/efflux-dates.component';
import { SendComponent } from './send/send.component';

import { NavComponent } from './layout/nav.component';

import { PasswordRepromptComponent } from './components/password-reprompt.component';
import { SetPinComponent } from './components/set-pin.component';
import { VerifyMasterPasswordComponent } from './components/verify-master-password.component';

import { registerLocaleData } from '@angular/common';
import localeAf from '@angular/common/locales/af';
import localeAz from '@angular/common/locales/az';
import localeBe from '@angular/common/locales/be';
import localeBg from '@angular/common/locales/bg';
import localeBn from '@angular/common/locales/bn';
import localeCa from '@angular/common/locales/ca';
import localeCs from '@angular/common/locales/cs';
import localeDa from '@angular/common/locales/da';
import localeDe from '@angular/common/locales/de';
import localeEl from '@angular/common/locales/el';
import localeEnGb from '@angular/common/locales/en-GB';
import localeEnIn from '@angular/common/locales/en-IN';
import localeEs from '@angular/common/locales/es';
import localeEt from '@angular/common/locales/et';
import localeFa from '@angular/common/locales/fa';
import localeFi from '@angular/common/locales/fi';
import localeFr from '@angular/common/locales/fr';
import localeHe from '@angular/common/locales/he';
import localeHr from '@angular/common/locales/hr';
import localeHu from '@angular/common/locales/hu';
import localeId from '@angular/common/locales/id';
import localeIt from '@angular/common/locales/it';
import localeJa from '@angular/common/locales/ja';
import localeKn from '@angular/common/locales/kn';
import localeKo from '@angular/common/locales/ko';
import localeLv from '@angular/common/locales/lv';
import localeMl from '@angular/common/locales/ml';
import localeNb from '@angular/common/locales/nb';
import localeNl from '@angular/common/locales/nl';
import localePl from '@angular/common/locales/pl';
import localePtBr from '@angular/common/locales/pt';
import localePtPt from '@angular/common/locales/pt-PT';
import localeRo from '@angular/common/locales/ro';
import localeRu from '@angular/common/locales/ru';
import localeSk from '@angular/common/locales/sk';
import localeSr from '@angular/common/locales/sr';
import localeMe from '@angular/common/locales/sr-Latn-ME';
import localeSv from '@angular/common/locales/sv';
import localeTh from '@angular/common/locales/th';
import localeTr from '@angular/common/locales/tr';
import localeUk from '@angular/common/locales/uk';
import localeVi from '@angular/common/locales/vi';
import localeZhCn from '@angular/common/locales/zh-Hans';
import localeZhTw from '@angular/common/locales/zh-Hant';

registerLocaleData(localeAf, 'af');
registerLocaleData(localeAz, 'az');
registerLocaleData(localeBe, 'be');
registerLocaleData(localeBg, 'bg');
registerLocaleData(localeBn, 'bn');
registerLocaleData(localeCa, 'ca');
registerLocaleData(localeCs, 'cs');
registerLocaleData(localeDa, 'da');
registerLocaleData(localeDe, 'de');
registerLocaleData(localeEl, 'el');
registerLocaleData(localeEnGb, 'en-GB');
registerLocaleData(localeEnIn, 'en-IN');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeEt, 'et');
registerLocaleData(localeFa, 'fa');
registerLocaleData(localeFi, 'fi');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeHe, 'he');
registerLocaleData(localeHr, 'hr');
registerLocaleData(localeHu, 'hu');
registerLocaleData(localeId, 'id');
registerLocaleData(localeIt, 'it');
registerLocaleData(localeJa, 'ja');
registerLocaleData(localeKn, 'kn');
registerLocaleData(localeKo, 'ko');
registerLocaleData(localeLv, 'lv');
registerLocaleData(localeMe, 'me');
registerLocaleData(localeMl, 'ml');
registerLocaleData(localeNb, 'nb');
registerLocaleData(localeNl, 'nl');
registerLocaleData(localePl, 'pl');
registerLocaleData(localePtBr, 'pt-BR');
registerLocaleData(localePtPt, 'pt-PT');
registerLocaleData(localeRo, 'ro');
registerLocaleData(localeRu, 'ru');
registerLocaleData(localeSk, 'sk');
registerLocaleData(localeSr, 'sr');
registerLocaleData(localeSv, 'sv');
registerLocaleData(localeTh, 'th');
registerLocaleData(localeTr, 'tr');
registerLocaleData(localeUk, 'uk');
registerLocaleData(localeVi, 'vi');
registerLocaleData(localeZhCn, 'zh-CN');
registerLocaleData(localeZhTw, 'zh-TW');

@NgModule({
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        DragDropModule,
        FormsModule,
        ReactiveFormsModule,
        ServicesModule,
        ToasterModule.forRoot(),
        ScrollingModule,
        A11yModule,
    ],
    declarations: [
        A11yTitleDirective,
        AddEditComponent,
        AddEditCustomFieldsComponent,
        ApiActionDirective,
        AppComponent,
        AttachmentsComponent,
        AutofocusDirective,
        BlurClickDirective,
        BoxRowDirective,
        CalloutComponent,
        CipherListVirtualScroll,
        CiphersComponent,
        CollectionsComponent,
        ColorPasswordPipe,
        EnvironmentComponent,
        ExportComponent,
        FallbackSrcDirective,
        FolderAddEditComponent,
        GroupingsComponent,
        HintComponent,
        I18nPipe,
        IconComponent,
        LockComponent,
        LoginComponent,
        NavComponent,
        PasswordGeneratorComponent,
        PasswordGeneratorHistoryComponent,
        PasswordHistoryComponent,
        PasswordRepromptComponent,
        PremiumComponent,
        RegisterComponent,
        RemovePasswordComponent,
        SearchCiphersPipe,
        SelectCopyDirective,
        SendAddEditComponent,
        SendComponent,
        SendEffluxDatesComponent,
        SetPasswordComponent,
        SetPinComponent,
        SettingsComponent,
        ShareComponent,
        SsoComponent,
        StopClickDirective,
        StopPropDirective,
        TrueFalseValueDirective,
        TwoFactorComponent,
        TwoFactorOptionsComponent,
        UpdateTempPasswordComponent,
        VaultComponent,
        VaultTimeoutInputComponent,
        VerifyMasterPasswordComponent,
        ViewComponent,
        ViewCustomFieldsComponent,
    ],
    providers: [DatePipe],
    bootstrap: [AppComponent],
})
export class AppModule { }
