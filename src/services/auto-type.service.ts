/**
 * Autotype Service
 *
 * Classes:
 *
 *
 * Enums:
 * Robokeys
 *
 * Methods:
 * keyboardEventToAccelerator()
 * beep()
 * resolvePlaceholder()
 */
// @ts-ignore
import process from 'child_process';
import { app, globalShortcut } from 'electron';
import {
    AutoTypeService as AutoTypeServiceBase,
    CipherService,
    MessagingService,
    PasswordGenerationService,
    PlatformUtilsService,
    StorageService,
} from 'jslib/abstractions';
import { ElectronConstants } from 'jslib/electron/electronConstants';
import { DeviceType } from 'jslib/enums';
import { Cipher } from 'jslib/models/domain';
import { CipherView, FieldView } from 'jslib/models/view';
import { AutoTypeView } from 'jslib/models/view/autoTypeView';
import { Window, windowManager } from 'node-window-manager'; // https://github.com/sentialx/node-window-manager
import { EOL } from 'os';
// @ts-ignore
import path from 'path';
// @ts-ignore
import robot from 'robotjs';
// Shim the missing matchall string function. TODO Remove me for ECMAScript 2020
// @ts-ignore
import matchAll from 'string.prototype.matchall';
declare global {
    // tslint:disable-next-line:interface-name
    interface RegExpStringIterator {
        next: () => {value: RegExpMatchArray, done: boolean};
        [Symbol.iterator]: () => RegExpStringIterator;
    }
    // tslint:disable-next-line:interface-name
    interface String {
        matchAll: (regexp: RegExp) => RegExpStringIterator;
    }
}
matchAll.shim();

// electron.globalShortcut supported keys
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const supportedKeys = [
    ...digits,
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24',
    '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|',
    '?', '>', '<', '`', '-', '=', '[', ']', '\\', ';', '\'', ',', '.', '/',
    'Plus', 'Space', 'Tab', 'Capslock', 'Numlock', 'Backspace', 'Delete', 'Insert', 'Return', 'Scrolllock',
    'Up', 'Down', 'Left', 'Right', 'Home', 'End', 'PageUp', 'PageDown', 'Escape', 'PrintScreen',
    'VolumeUp', 'VolumeDown', 'VolumeMute', 'MediaNextTrack', 'MediaPreviousTrack', 'MediaStop', 'MediaPlayPause',
    'numdec', 'numadd', 'numsub', 'nummult', 'numdiv',
    'num0', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6', 'num7', 'num8', 'num9',
];

// KeyboardEvent key location constants
const DOM_KEY_LOCATION_STANDARD = 0;
const DOM_KEY_LOCATION_LEFT = 1;
const DOM_KEY_LOCATION_RIGHT = 2;
const DOM_KEY_LOCATION_NUMPAD = 3;

/**
 * Convert a KeyboardEvent to an accelerator string required by electron.globalShortcut
 * @param event KeyboardEvent instance
 */
export function keyboardEventToAccelerator(event: KeyboardEvent): string {
    const keys = [];
    if (event.metaKey) {
        keys.push('Super');
    }
    if (event.altKey) {
        if (event.location === DOM_KEY_LOCATION_RIGHT) {
            keys.push('AltGr');
        } else {
            keys.push('Alt');
        }
    }
    if (event.ctrlKey) {
        keys.push('CommandOrControl');
    }
    if (event.shiftKey) {
        keys.push('Shift');
    }
    let key = null;
    switch (event.key) {
        case '.':
            if (event.location === DOM_KEY_LOCATION_NUMPAD) {
                key = 'numdec';
            } else {
                key = event.key;
            }
            break;
        case '-':
            if (event.location === DOM_KEY_LOCATION_NUMPAD) {
                key = 'numsub';
            } else {
                key = event.key;
            }
            break;
        case '/':
            if (event.location === DOM_KEY_LOCATION_NUMPAD) {
                key = 'numdiv';
            } else {
                key = event.key;
            }
            break;
        case '*':
            if (event.location === DOM_KEY_LOCATION_NUMPAD) {
                key = 'nummult';
            } else {
                key = event.key;
            }
            break;
        case '+':
            if (event.location === DOM_KEY_LOCATION_NUMPAD) {
                key = 'numadd';
            } else {
                key = 'Plus';
            }
            break;
        case ' ':
            key = 'Space';
            break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            key = event.key.substr(5);
            break;
        case 'PageUp':
        case 'PageDown':
            key = event.key;
            break;
        default:
            key = event.key.charAt(0).toUpperCase() + event.key.toLowerCase().slice(1);
            break;
    }
    if (event.location === DOM_KEY_LOCATION_NUMPAD && digits.includes(key)) { key = 'num' + key; }
    if (!supportedKeys.includes(key)) { return ''; }
    keys.push(key);
    return keys.join('+');
}

// Patterns for Keepass placeholders
const placeholderPattern = new RegExp(
    '{(T-REPLACE-RX):(.)(.+?)\\2(.+?)\\2(.+?)\\2}' +
    '|{(T-CONV|CMD):(.)(.+?)\\7(.+?)\\7}' +
    '|{(NEWPASSWORD)(?::(.)(.+?)\\11)?}' +
    '|{(REF):([TUPANIO])@([TUPANIO]):([^}]+)}' +
    '|{(PICKCHARS)(?::([^:}]+)(?::([^}]+))?)?}' +
    '|{(C):([^}]*)}' +
    '|{(DELAY=)([^}]+)}' +
    '|{([^:} ]+)(?:[: ]([^}]+))?}',
    'gi',
);

// Used by {REF: }
const searchPattern = new RegExp('(-)?(?:(["\'])(.+?)\\2|[^"\' ]+)', 'g');

// Used by {CMD: }
const cmdPattern = new RegExp('(M|O|W|WS|V)=([^,]+)', 'g');

// Keys supported by robotjs
enum RoboKeys {
    backspace, delete, enter, tab, escape, up, down, right, left, home, end, pageup, pagedown,
    f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, command, alt, control, shift, right_shift,
    space, printscreen, insert, audio_mute, audio_vol_down, audio_vol_up, audio_play, audio_stop, audio_pause,
    audio_prev, audio_next, audio_rewind, audio_forward, audio_repeat, audio_random,
    numpad_0, numpad_1, numpad_2, numpad_3, numpad_4, numpad_5, numpad_6, numpad_7, numpad_8, numpad_9,
    lights_mon_up, lights_mon_down, lights_kbd_toggle, lights_kbd_up, lights_kbd_down,
}

/**
 * Play a tone for a duration
 * @param freq Frequency in Hz
 * @param duration Duration in milliseconds
 */
function beep(freq: number, duration: number) {
    const context = new AudioContext();
    const o = context.createOscillator();
    const g = context.createGain();
    o.connect(g);
    g.connect(context.destination);
    o.frequency.value = freq;
    o.start();
    o.stop(context.currentTime + (duration / 1000));
}

function matchToArgs(match: RegExpMatchArray): [string, ...string[]] {
    const index = match.findIndex((val: string, i: number) => (i > 0 && val !== ''));
    return [match[index], ...match.slice(index + 1)];
}

export class AutoTypeService implements AutoTypeServiceBase {
    private readonly systemClipModifier: string;

    constructor(private storageService: StorageService, private cipherService: CipherService,
                private platformUtilsService: PlatformUtilsService, private messagingService: MessagingService,
                private passwordGenerationService: PasswordGenerationService) {
        this.systemClipModifier =
            this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop ? 'command' : 'ctrl';
    }

    init() {
        app.on('will-quit', () => {
            // Unregister all shortcuts.
            globalShortcut.unregisterAll();
        });
        app.on('ready', () => {
            // Register auto-type hotkey
            this.update();
        });
    }

    update() {
        globalShortcut.unregisterAll();
        this.storageService.get<string>(ElectronConstants.enableAutoTypeKey).then((enabled) => {
            if (enabled) {
                this.storageService.get<string>(ElectronConstants.AutoTypeHotkeyKey).then(
                    (accelerator) => {
                        if (accelerator) {
                            globalShortcut.register(accelerator, () => {
                                this.typeTarget();
                            });

                            if (!globalShortcut.isRegistered(accelerator)) {
                                throw new Error('Failed to register auto-type hotkey.');
                            }
                        }
                    });
            }
        });
    }

    async getTarget(): Promise<string> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(reject, 10000, 'Took too long to select a window');
            windowManager.once('window-activated', (window: Window) => {
                clearTimeout(timer);
                resolve(window.getTitle());
            });
        });
    }

    getPossibleTargets(): string[] {
        return windowManager.getWindows().map((w: Window) => w.getTitle());
    }

    typeUsingClip(str: string) {
        if (str.length === 0) { return; }
        this.platformUtilsService.copyToClipboard(str);
        robot.keyTap('v', this.systemClipModifier);
    }

    async typeTarget() {
        const target = await this.getTarget();

        // Get candidate targets
        const candidates = [];
        const ciphers = await this.cipherService.getAll();
        for (const cipher of ciphers) {
            if (cipher.enableAutoType) {
                const decCipher = await cipher.decrypt();
                for (const targetCandidate of decCipher.autoTypeTargets) {
                    const match = target.match(targetCandidate.target);
                    if (match[0].length) {
                        candidates.push({match: match, target: targetCandidate, cipher: cipher, decCipher: decCipher});
                    }
                }
            }
        }

        // Decide on final candidate
        let candidate: {match: RegExpMatchArray, target: AutoTypeView, cipher: Cipher, decCipher: CipherView} = null;
        if (candidates.length === 1) {
            candidate = candidates[0];
        } else if (candidates.length > 1) {
            candidates.sort((a, b) => b.match.length - a.match.length);
            candidate = candidates[0]; // TODO show context menu to pick candidate
        } else {
            return false; // candidate will never be null past this point
        }

        // TODO switch to typing codes to add support for more keys
        //  when https://github.com/octalmage/robotjs/pull/357 is merged

        // Use same time across all placeholders
        const now = new Date(Date.now());

        // Replace placeholders
        const placeholders = await Promise.all<Array<string | RoboKeys | (() => Promise<string>)>>(
            Array.from(candidate.target.sequence.matchAll(placeholderPattern), (match: RegExpMatchArray) => {
                return this.resolvePlaceholder(
                    candidate.decCipher,
                    candidate.cipher,
                    ciphers,
                    now,
                    ...matchToArgs(match),
                );
            }),
        );

        // Don't clobber current clipboard content
        const oldClip = await this.platformUtilsService.readFromClipboard();

        // Execute sequence
        let modifier: string[] = [];
        for (const placeholder of placeholders) {
            for (let element of placeholder) {
                // Break up strings containing modifiers or special keys
                switch (typeof element) {
                    case 'number':
                        robot.keyTap(RoboKeys[element], modifier);
                        modifier = [];
                        break;
                    case 'function':
                        element = await element();
                        // fall through
                    case 'string':
                        if (element.length > 1) {
                            let clip = '';
                            const median = element.split('')
                                .sort((a: string, b: string) => a.localeCompare(b))[Math.floor(element.length / 2)];
                            for (let i = 0; i < element.length; ++i) {
                                // Handle special keys
                                if ('+^%~ '.includes(element[i])) {
                                    // Not compatible with clip board, push existing clipboard
                                    this.typeUsingClip(clip);
                                    clip = '';
                                    switch (element[i]) {
                                        case '+':
                                            modifier.push(RoboKeys[RoboKeys.shift]);
                                            break;
                                        case '^':
                                            modifier.push(RoboKeys[RoboKeys.control]);
                                            break;
                                        case '%':
                                            modifier.push(RoboKeys[RoboKeys.alt]);
                                            break;
                                        case '~':
                                            robot.keyTap(RoboKeys[RoboKeys.enter], modifier);
                                            modifier = [];
                                            break;
                                        case ' ':
                                            robot.keyTap(RoboKeys[RoboKeys.space], modifier);
                                            modifier = [];
                                            break;
                                    }
                                    continue;
                                }
                                if (candidate.target.tcato && modifier.length === 0) {
                                    // Split sequence into tcato chunks
                                    // Compare to median letter so that half of the string ends up in the clipboard
                                    // but which letters are chosen vary from string to string
                                    if (element[i].localeCompare(median) < 0) {
                                        clip += element[i];
                                    } else {
                                        this.typeUsingClip(clip);
                                        clip = '';
                                        robot.keyTap(element[i], modifier);
                                        modifier = [];
                                    }
                                } else {
                                    robot.keyTap(element[i], modifier);
                                    modifier = [];
                                }
                            }
                            if (clip.length > 0) {
                                this.typeUsingClip(clip);
                                clip = '';
                            }
                        } else if (element.length > 0) {
                            robot.keyTap(element, modifier);
                            modifier = [];
                        }
                        break;
                }
            }
        }

        // this.platformUtilsService.copyToClipboard(seq);
        this.platformUtilsService.copyToClipboard(oldClip);
    }

    /**
     * Make a best attempt to convert the placeholders to a string
     * This is used when a placeholder requires another placeholder to be a string in order to resolve
     * @param placeholders Array of placeholders
     */
    async flattenPlaceholders(placeholders: Array<string | RoboKeys | (() => Promise<string>)>): Promise<string> {
        for (let i = 0; i < placeholders.length; ++i) {
            const placeholder = placeholders[i];
            if (typeof placeholder === 'function') {
                placeholders[i] = await placeholder();
            } else if (typeof placeholder !== 'string') {
                switch (placeholder) {
                    case RoboKeys.enter:
                        placeholders[i] = EOL;
                        break;
                    case RoboKeys.space:
                        placeholders[i] = ' ';
                        break;
                    case RoboKeys.tab:
                        placeholders[i] = '\t';
                        break;
                    default:
                        const name = RoboKeys[placeholder];
                        if (name.startsWith('numpad_')) {
                            placeholders[i] = name.charAt(name.length - 1);
                            break;
                        }
                        placeholders[i] = '';
                        break;
                }
            }
        }
        return placeholders.join('');
    }

    /**
     * Resolve placeholders matched by placeholderPattern
     * See https://keepass.info/help/base/placeholders.html
     * If a function is returned, the function must return a string
     * @param decCipher decrypted instance of cipher param
     * @param cipher Cipher instance to refer to when resolving placeholder
     * @param ciphers Array of ciphers to refer to when searching for value
     * @param now instance of Date representing current date-time
     * @param placeholder Name of placeholder
     * @param args Capture groups of placeholderPattern
     * @return Hetergoenous array of strings, Robokeys, and callables representing the placeholders function or result
     */
    async resolvePlaceholder(
        decCipher: CipherView,
        cipher: Cipher,
        ciphers: Cipher[],
        now: Date,
        placeholder: string,
        ...args: string[]
    ): Promise<Array<string | RoboKeys | (() => Promise<string>)>> {
        const param = args.length ? args[0] : '';
        switch (placeholder.toUpperCase()) {
            case 'T-REPLACE-RX': {
                const [text, pattern, replace] = args;
                let flatText = '';
                let flatPattern = '';
                let flatReplace = '';
                // Each param can contain placeholders
                for (const match of text.matchAll(placeholderPattern)) {
                    flatText += await this.flattenPlaceholders(
                        await this.resolvePlaceholder(decCipher, cipher, ciphers, now, ...matchToArgs(match)),
                    );
                }
                for (const match of pattern.matchAll(placeholderPattern)) {
                    flatPattern += await this.flattenPlaceholders(
                        await this.resolvePlaceholder(decCipher, cipher, ciphers, now, ...matchToArgs(match)),
                    );
                }
                for (const match of replace.matchAll(placeholderPattern)) {
                    flatReplace += await this.flattenPlaceholders(
                        await this.resolvePlaceholder(decCipher, cipher, ciphers, now, ...matchToArgs(match)),
                    );
                }
                flatText = flatText.replace(flatPattern, flatReplace);
                return [flatText];
            }
            case 'T-CONV': {
                const [text, type] = args;
                let flatText = '';
                for (const match of text.matchAll(placeholderPattern)) {
                    flatText += await this.flattenPlaceholders(
                        await this.resolvePlaceholder(decCipher, cipher, ciphers, now, ...matchToArgs(match)),
                    );
                }
                switch (type.toUpperCase()) {
                    case 'UPPER':
                    case 'U':
                        flatText = flatText.toUpperCase();
                        break;
                    case 'LOWER':
                    case 'L':
                        flatText = flatText.toLowerCase();
                        break;
                    case 'BASE64':
                        flatText = btoa(flatText);
                        break;
                    case 'HEX':
                        try {
                            flatText = flatText.split('').map((v: string) =>
                                v.charCodeAt(0).toString(16),
                            ).join('');
                        } catch (e) {
                            flatText = '';
                        }
                        break;
                    case 'URI':
                        flatText = encodeURIComponent(flatText);
                        break;
                    case 'URI-DEC':
                        flatText = decodeURIComponent(flatText);
                        break;
                    case 'RAW':
                        const text2 = flatText;
                        flatText = '';
                        for (const match of text2.matchAll(placeholderPattern)) {
                            flatText += await this.flattenPlaceholders(
                                await this.resolvePlaceholder(decCipher, cipher, ciphers, now, ...matchToArgs(match)),
                            );
                        }
                        break;
                }
                return [flatText];
            }
            case 'CMD': {
                const [command, options] = args;
                let wait = false;
                let output = true;
                const opt = {
                    shell: true,
                    hide: true,
                };
                for (const [_, o, val] of options.matchAll(cmdPattern)) {
                    switch (o) {
                        case 'M':
                            opt.shell = val !== 'C';
                            break;
                        case 'O':
                            output = val === '1';
                            break;
                        case 'W':
                            wait = val === '1';
                            break;
                        case 'WS':
                            opt.hide = val === 'H';
                            break;
                        case 'V':
                            // Admin not supported, use a script to elevate.
                            break;
                    }
                }

                if (!command) { return []; }
                if (wait && !output) {
                    return [process.execSync(command, opt)];
                } else {
                    process.exec(command, opt);
                    return [];
                }
            }
            case 'NEWPASSWORD': {
                const profile = param;
                switch (profile) { // TODO need to build better password generators like keepass
                    case 'phrase':
                        return [await this.passwordGenerationService.generatePassphrase({})];
                    case 'word':
                    default:
                        return [await this.passwordGenerationService.generatePassword({})];
                }
            }
            case 'PICKCHARS': {
                const [field, opt] = args;
                // TODO need modal
                return [];
            }
            case 'C':
                // const comment = param;
                return [];
            case 'S':
                // Custom strings can be referenced using {S:Name}.
                const result = decCipher.fields.find((f: FieldView) => f.name === param);
                if (result) {
                    return [result.value];
                } else {
                    return [];
                }
            case 'REF':
                // https://keepass.info/help/base/fieldrefs.html
                const [wanted, search, query] = args;
                const queryItems = query.matchAll(searchPattern);

                let found = null;
                cipher: for (const c of ciphers) {
                    const values = [];
                    switch (search) {
                        case 'T':
                            // T	Title
                            values.push(await c.name.decrypt(c.organizationId));
                            break;
                        case 'U':
                            // U	User name
                            values.push(await c.login.username.decrypt(c.organizationId));
                            break;
                        case 'P':
                            // P	Password
                            values.push(await c.login.password.decrypt(c.organizationId));
                            break;
                        case 'A':
                            // A	URL
                            for (const uri of c.login.uris) {
                                values.push((await uri.decrypt(c.organizationId)).uri);
                            }
                            break;
                        case 'N':
                            // N	Notes
                            values.push(await c.notes.decrypt(c.organizationId));
                            break;
                        case 'I':
                            // I	UUID
                            values.push(c.id);
                            break;
                        case 'O':
                            // O	Other custom strings
                            for (const f of c.fields) {
                                const decField = await f.decrypt(c.organizationId);
                                values.push(decField.name);
                                values.push(decField.value);
                            }
                            break;
                        default:
                            return [];
                    }
                    for (const value of values) {
                        for (const [_, neg, item] of queryItems) {
                            if (value.includes(item) === (neg === '-')) { // ~XOR
                                continue cipher;
                            }
                        }
                    }
                    found = c;
                    break;
                }
                if (found === null) {
                    return [];
                }
                switch (wanted) {
                    case 'T':
                        // T	Title
                        return [await found.name.decrypt(found.organizationId)];
                    case 'U':
                        // U	User name
                        return [await found.login.username.decrypt(found.organizationId)];
                    case 'P':
                        // P	Password
                        return [await found.login.password.decrypt(found.organizationId)];
                    case 'A':
                        // A	URL
                        for (const uri of found.login.uris) { // TODO should there be better criteria than first uri?
                            return [(await uri.decrypt(found.organizationId)).uri];
                        }
                        return [];
                    case 'N':
                        // N	Notes
                        return [await found.notes.decrypt(found.organizationId)];
                    case 'I':
                        // I	UUID
                        return [found.id];
                    case 'O':
                    default:
                        return [];
                }
            case 'TITLE':
                return [decCipher.name];
            case 'USERNAME':
                return [decCipher.login.username];
            case 'PASSWORD':
                return [decCipher.login.password];
            case 'NOTES':
                return [decCipher.notes];
            case 'URL':
            case 'BASE': {
                const uri = new URL(decCipher.login.uri);
                switch (param) {
                    case 'RMVSCM':
                        if (uri.protocol) {
                            return [uri.href.substr(uri.protocol.length)];
                        } else {
                            return [uri.href];
                        }
                    case 'SCM':
                        return [uri.protocol];
                    case 'HOST':
                        return [uri.hostname];
                    case 'PORT':
                        return [uri.port];
                    case 'PATH':
                        return [uri.pathname];
                    case 'QUERY':
                        return [uri.search];
                    case 'USERINFO':
                        return [uri.username + ':' + uri.password];
                    case 'USERNAME':
                        return [uri.username];
                    case 'PASSWORD':
                        return [uri.password];
                    default:
                        return [uri.href];
                }
            }
            case 'INTERNETEXPLORER':
                return []; // Not supported
            case 'FIREFOX':
                return []; // Not supported
            case 'OPERA':
                return []; // Not supported
            case 'GOOGLECHROME':
                return []; // Not supported
            case 'SAFARI':
                return []; // Not supported
            case 'APPDIR':
                return []; // Not supported?
            case 'GROUP':
                return [decCipher.folderId];
            case 'GROUP_PATH':
                return []; // Not supported
            case 'GROUP_NOTES':
                return []; // Not supported
            case 'GROUP_SEL':
                return []; // TODO need to locate where current selected folder is stored in code
            case 'GROUP_SEL_PATH':
                return []; // Not supported
            case 'GROUP_SEL_NOTES':
                return []; // Not supported
            case 'DB_PATH':
                return []; // Not supported
            case 'DB_DIR':
                return []; // Not supported
            case 'DB_NAME':
                return []; // Not supported
            case 'DB_BASENAME':
                return []; // Not supported
            case 'DB_EXT':
                return []; // Not supported
            case 'ENV_DIRSEP':
                return [path.sep];
            case 'ENV_PROGRAMFILES_X86':
                return []; // TODO need to wrangle env variables
            case 'DT_SIMPLE':
                return [[
                    now.getFullYear(), now.getMonth(), now.getDay(),
                    now.getHours(), now.getMinutes(), now.getSeconds(),
                ].map((x) => x.toString()).join('')];
            case 'DT_YEAR':
                return [now.getFullYear().toString()];
            case 'DT_MONTH':
                return [now.getMonth().toString()];
            case 'DT_DAY':
                return [now.getDay().toString()];
            case 'DT_HOUR':
                return [now.getHours().toString()];
            case 'DT_MINUTE':
                return [now.getMinutes().toString()];
            case 'DT_SECOND':
                return [now.getSeconds().toString()];
            case 'DT_UTC_SIMPLE':
                return [[
                    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDay(),
                    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(),
                ].map((x) => x.toString()).join('')];
            case 'DT_UTC_YEAR':
                return [now.getUTCFullYear().toString()];
            case 'DT_UTC_MONTH':
                return [now.getUTCMonth().toString()];
            case 'DT_UTC_DAY':
                return [now.getUTCDay().toString()];
            case 'DT_UTC_HOUR':
                return [now.getUTCHours().toString()];
            case 'DT_UTC_MINUTE':
                return [now.getUTCMinutes().toString()];
            case 'DT_UTC_SECOND':
                return [now.getUTCSeconds().toString()];
            case 'PICKFIELD':
                return []; // TODO need modal
            case 'PASSWORD_ENC':
                return [cipher.login.password.encryptedString];
            case 'HMACOTP':
                return []; // TODO need HMACOTP generator
            //  ----- Keys -----
            case 'TAB':
                return [RoboKeys.tab];
            case 'ENTER':
                return [RoboKeys.enter];
            case 'UP':
                return [RoboKeys.up];
            case 'DOWN':
                return [RoboKeys.down];
            case 'LEFT':
                return [RoboKeys.left];
            case 'RIGHT':
                return [RoboKeys.right];
            case 'INSERT':
            case 'INS':
                return [RoboKeys.insert];
            case 'DELETE':
            case 'DEL':
                return [RoboKeys.delete];
            case 'HOME':
                return [RoboKeys.home];
            case 'END':
                return [RoboKeys.end];
            case 'PGUP':
                return [RoboKeys.pageup];
            case 'PGDN':
                return [RoboKeys.pagedown];
            case 'SPACE':
                return [RoboKeys.space];
            case 'BACKSPACE':
            case 'BS':
            case 'BKSP':
                return [RoboKeys.backspace];
            case 'BREAK':
                return []; // TODO https://github.com/octalmage/robotjs/issues/490
            case 'CAPSLOCK':
                return []; // TODO https://github.com/octalmage/robotjs/issues/490
            case 'ESC':
                return [RoboKeys.escape];
            case 'WIN':
            case 'LWIN':
                return [RoboKeys.command];
            case 'RWIN':
                return [RoboKeys.command];
            case 'APPS':
                return []; // TODO change to keycode after https://github.com/octalmage/robotjs/pull/357
            case 'HELP':
                return []; // TODO change to keycode after https://github.com/octalmage/robotjs/pull/357
            case 'NUMLOCK':
                return []; // TODO https://github.com/octalmage/robotjs/issues/490
            case 'PRTSC':
                return [RoboKeys.printscreen];
            case 'SCROLLLOCK':
                return []; // TODO https://github.com/octalmage/robotjs/issues/490
            case 'ALT':
                return [RoboKeys.alt];
            case 'CTRL':
                return [RoboKeys.control];
            case 'SHIFT':
                switch (param.toUpperCase()) {
                    case 'RIGHT':
                        return [RoboKeys.right_shift];
                    case 'LEFT':
                    default:
                        return [RoboKeys.shift];
                }
            case 'F1':
            case 'F2':
            case 'F3':
            case 'F4':
            case 'F5':
            case 'F6':
            case 'F7':
            case 'F8':
            case 'F9':
            case 'F10':
            case 'F11':
            case 'F12':
                // @ts-ignore
                return [RoboKeys[placeholder.toUpperCase()]];
            case 'F13':
            case 'F14':
            case 'F15':
            case 'F16':
                return []; // Not supported
            case '^':
                return ['^'];
            case '%':
                return ['%'];
            case '+':
                return ['+'];
            case '~':
                return ['~'];
            case 'ADD':
                return ['+']; // TODO change to keycode after https://github.com/octalmage/robotjs/pull/357
            case 'SUBTRACT':
                return ['-']; // TODO change to keycode after https://github.com/octalmage/robotjs/pull/357
            case 'MULTIPLY':
                return ['*']; // TODO change to keycode after https://github.com/octalmage/robotjs/pull/357
            case 'DIVIDE':
                return ['/']; // TODO change to keycode after https://github.com/octalmage/robotjs/pull/357
            case 'NUMPAD0':
            case 'NUMPAD1':
            case 'NUMPAD2':
            case 'NUMPAD3':
            case 'NUMPAD4':
            case 'NUMPAD5':
            case 'NUMPAD6':
            case 'NUMPAD7':
            case 'NUMPAD8':
            case 'NUMPAD9':
                // @ts-ignore
                return [RoboKeys['numpad_' + placeholder.charAt(6)]];
            // ---- Commands ----
            case 'DELAY':
                await new Promise((resolve) => setTimeout(resolve, parseInt(param, 10)));
                return [];
            case 'DELAY=':
                const delay = param;
                robot.setKeyboardDelay(parseInt(delay, 10));
                return [];
            case 'CLEARFIELD':
                return [() => {
                    // Select all and delete
                    robot.keyTap('a', this.systemClipModifier );
                    robot.keyTap('backspace');
                    return Promise.resolve('');
                }];
            case 'APPACTIVATE':
                return [() => {
                    const window = windowManager.getWindows().find((w: Window) => w.getTitle().includes(param));
                    if (window) { window.bringToTop(); }
                    return Promise.resolve('');
                }];
            case 'BEEP':
                const [freq, duration] = param.split(' ');
                return [() => {
                    beep(parseFloat(freq), parseInt(duration, 10));
                    return Promise.resolve('');
                }];
            case 'VKEY':
            case 'VKEY-NX':
            case 'VKEY-EX':
                return []; // TODO https://docs.microsoft.com/en-us/windows/desktop/inputdev/virtual-key-codes
        }
    }
}
