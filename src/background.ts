import MainBackground from './background/main.background';

const bitwardenIsBackground = (window as any).bitwardenIsBackground = true;
const bitwardenMain = (window as any).bitwardenMain = new MainBackground();

bitwardenMain.bootstrap();
