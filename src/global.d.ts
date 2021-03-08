declare function escape(s: string): string;
declare function unescape(s: string): string;
declare module 'node-ipc' {
    const x: any;
    export = x;
}

/*
@override by cozy
Globals required for browser
 */
declare var opr: any;
declare var chrome: any;
declare var browser: any;
declare var safari: any;
