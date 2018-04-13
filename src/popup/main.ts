import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'web-animations-js';

// tslint:disable-next-line
require('./scss/popup.scss');
// tslint:disable-next-line
require('../scripts/duo.js');

import { AppModule } from './app.module';

if (process.env.ENV === 'production') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
