import MainBackground from './background/main.background';
import i18nService from './services/i18nService.js';

window.forge = require('node-forge');
window.tldjs = require('tldjs');

const bg_isBackground = window.bg_isBackground = true;
const bg_main = window.bg_main = new MainBackground(new i18nService());
require('./scripts/analytics.js');
bg_main.bootstrap();
