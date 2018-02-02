import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

require('../scss/styles.scss');
require('../scripts/duo.js');

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
