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

import { LoginComponent } from './accounts/login.component';

import { ApiActionDirective } from 'jslib/angular/directives/api-action.directive';
import { AutofocusDirective } from 'jslib/angular/directives/autofocus.directive';
import { BlurClickDirective } from 'jslib/angular/directives/blur-click.directive';
import { FallbackSrcDirective } from 'jslib/angular/directives/fallback-src.directive';
import { StopClickDirective } from 'jslib/angular/directives/stop-click.directive';
import { StopPropDirective } from 'jslib/angular/directives/stop-prop.directive';

import { I18nPipe } from 'jslib/angular/pipes/i18n.pipe';

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
        ApiActionDirective,
        AppComponent,
        AutofocusDirective,
        BlurClickDirective,
        FallbackSrcDirective,
        I18nPipe,
        LoginComponent,
        StopClickDirective,
        StopPropDirective
    ],
    entryComponents: [

    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
