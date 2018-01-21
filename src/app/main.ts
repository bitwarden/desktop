import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

require('../scss/styles.scss');

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
