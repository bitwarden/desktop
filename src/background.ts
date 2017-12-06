import MainBackground from './background/main.background';

// tslint:disable-next-line:variable-name
const bg_isBackground = (window as any).bg_isBackground = true;

// tslint:disable-next-line:variable-name
const bg_main = (window as any).bg_main = new MainBackground();
// tslint:disable-next-line:no-var-requires
require('./scripts/analytics.js');
bg_main.bootstrap();
