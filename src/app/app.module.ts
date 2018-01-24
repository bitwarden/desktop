import 'core-js';
import 'zone.js/dist/zone';

import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ServicesModule } from './services/services.module';

import { AppComponent } from './app.component';
import { CiphersComponent } from './vault/ciphers.component';
import { GroupingsComponent } from './vault/groupings.component';
import { IconComponent } from './vault/icon.component';
import { LoginComponent } from './accounts/login.component';
import { VaultComponent } from './vault/vault.component';
import { ViewComponent } from './vault/view.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        ServicesModule,
    ],
    declarations: [
        AppComponent,
        CiphersComponent,
        GroupingsComponent,
        IconComponent,
        LoginComponent,
        VaultComponent,
        ViewComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
