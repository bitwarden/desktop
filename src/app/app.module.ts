import 'zone.js/dist/zone';

import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './accounts/login.component';

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
    ],
    declarations: [
        AppComponent,
        LoginComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
