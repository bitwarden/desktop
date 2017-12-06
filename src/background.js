import MainBackground from './background/main.background';
import i18nService from './services/i18nService.js';

window.forge = require('node-forge');
window.tldjs = require('tldjs');

window.bg_isBackground = true;
window.bg_main = new MainBackground(new i18nService());
require('./scripts/analytics.js');
window.bg_main.bootstrap();
