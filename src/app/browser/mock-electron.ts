const remote = {
    Menu             : () => { return; },
    MenuItem         : () => { return; },
    getCurrentWindow : () => { return; },
    app              : {
        getPath : () => { return; },
    },
};

const ipcRenderer = {
    invoke : (channel: string, ...args: any[]): Promise<any> => {
        throw new Error('ipcRenderer.invoke not implemented');
    },
};

export { remote, ipcRenderer };
