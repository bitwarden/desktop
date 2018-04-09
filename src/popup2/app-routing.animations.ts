import {
    trigger,
    animate,
    style,
    group,
    query,
    transition,
} from '@angular/animations';

const queryShown = query(':enter, :leave', [
    style({ position: 'fixed', width: '100%', height: '100%' }),
], { optional: true });

// ref: https://github.com/angular/angular/issues/15477
const queryChildRoute = query('router-outlet ~ *', [
    style({}),
    animate(1, style({})),
], { optional: true });

const speed = '0.4s';

export function queryTranslate(direction: string, axis: string, from: number, to: number, zIndex: number = 1000) {
    return query(':' + direction, [
        style({ transform: 'translate' + axis + '(' + from + '%)', zIndex: zIndex, boxShadow: '0 3px 2px -2px gray' }),
        animate(speed + ' ease-in-out', style({ transform: 'translate' + axis + '(' + to + '%)' })),
    ], { optional: true });
}

export function queryTranslateX(direction: string, from: number, to: number, zIndex: number = 1000) {
    return queryTranslate(direction, 'X', from, to, zIndex);
}

export function queryTranslateY(direction: string, from: number, to: number, zIndex: number = 1000) {
    return queryTranslate(direction, 'Y', from, to, zIndex);
}

const inSlideLeft = [
    queryShown,
    group([
        queryTranslateX('enter', 100, 0),
        queryTranslateX('leave', 0, -100),
        queryChildRoute,
    ]),
];

const outSlideRight = [
    queryShown,
    group([
        queryTranslateX('enter', -100, 0),
        queryTranslateX('leave', 0, 100),
    ]),
];

const inSlideUp = [
    queryShown,
    group([
        queryTranslateY('enter', 100, 0, 1010),
        queryTranslateY('leave', 0, 0),
        queryChildRoute,
    ]),
];

const outSlideDown = [
    queryShown,
    group([
        queryTranslateY('enter', 0, 0),
        queryTranslateY('leave', 0, 100, 1010),
    ]),
];

const inSlideDown = [
    queryShown,
    group([
        queryTranslateY('enter', -100, 0, 1010),
        queryTranslateY('leave', 0, 0),
        queryChildRoute,
    ]),
];

const outSlideUp = [
    queryShown,
    group([
        queryTranslateY('enter', 0, 0),
        queryTranslateY('leave', 0, -100, 1010),
    ]),
];

export const routerTransition = trigger('routerTransition', [
    transition('home => login', inSlideLeft),
    transition('login => home', outSlideRight),

    transition('login => hint', inSlideUp),
    transition('hint => login', outSlideDown),

    transition('tabs => ciphers', inSlideLeft),
    transition('ciphers => tabs', outSlideRight),

    transition('tabs => view-cipher, ciphers => view-cipher', inSlideUp),
    transition('view-cipher => tabs, view-cipher => ciphers', outSlideDown),

    transition('view-cipher => edit-cipher', inSlideUp),
    transition('edit-cipher => view-cipher', outSlideDown),

    transition('tabs => add-cipher, ciphers => add-cipher', inSlideUp),
    transition('add-cipher => tabs, add-cipher => ciphers', outSlideDown),
]);
