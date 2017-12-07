import MainBackground from './background/main.background';

const bitwardenIsBackground = (window as any).bitwardenIsBackground = true;
const bitwardenMain = (window as any).bitwardenMain = new MainBackground();

// tslint:disable-next-line:no-var-requires
require('./scripts/analytics.js');

bitwardenMain.bootstrap();
