import 'core-js';
import 'zone.js/dist/zone';

import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ServicesModule } from './services/services.module';

import { AppComponent } from './app.component';
import { IconComponent } from './vault/icon.component';
import { LoginComponent } from './accounts/login.component';
import { VaultComponent } from './vault/vault.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        ServicesModule,
    ],
    declarations: [
        AppComponent,
        IconComponent,
        LoginComponent,
        VaultComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
