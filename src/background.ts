import MainBackground from './background/main.background';

const bitwardenMain = (window as any).bitwardenMain = new MainBackground();
bitwardenMain.bootstrap().then(() => {
    // Finished bootstrapping
});
