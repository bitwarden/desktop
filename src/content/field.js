!(function () {
    var icons = [];

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'setFieldOverlayIcons') {
            setFieldOverlayIcons();
            sendResponse();
            return true;
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        setFieldOverlayIcons();

        var bodies = document.querySelectorAll('body'),
            setIconsTimeoutId = null;

        if (bodies.length > 0) {
            var obs = new window.MutationObserver(function (mutations, observer) {
                var refreshIcons = false;
                for (var i = 0; i < mutations.length; i++) {
                    var mutation = mutations[i];
                    for (var j = 0; j < mutation.addedNodes.length; j++) {
                        if (mutation.addedNodes[j].className !== 'bitwarden-field-icon') {
                            refreshIcons = true;
                            break;
                        }
                    }

                    if (refreshIcons) {
                        break;
                    }

                    for (var j = 0; j < mutation.removedNodes.length; j++) {
                        if (mutation.removedNodes[j].className !== 'bitwarden-field-icon') {
                            refreshIcons = true;
                            break;
                        }
                    }

                    if (refreshIcons) {
                        break;
                    }
                }

                if (refreshIcons) {
                    if (setIconsTimeoutId) {
                        clearTimeout(setIconsTimeoutId);
                        setIconsTimeoutId = null;
                    }

                    //setFieldOverlayIcons();
                    setIconsTimeoutId = setTimeout(setFieldOverlayIcons, 1000);
                }
                else {
                    adjustIconPositions();
                }
            });

            obs.observe(bodies[0], { childList: true, subtree: true, attributes: true, characterData: true, attributeFilter: ['style'] });
        }
    }, false);

    function setFieldOverlayIcons() {
        for (var i = 0; i < icons.length; i++) {
            icons[i].icon.parentElement.removeChild(icons[i].icon);
        }
        icons = [];

        var pageDetails = JSON.parse(collect(document));
        if (pageDetails) {
            var iconFields = [];

            for (i = 0; i < pageDetails.fields.length; i++) {
                var f = pageDetails.fields[i];
                if (f.type === 'password') {
                    iconFields.push(f);

                    var fieldJustBeforePassword = null;
                    for (var j = 0; j < pageDetails.fields.length; j++) {
                        var f2 = pageDetails.fields[j];
                        if ((f2.type === 'text' || f2.type === 'email') && f2.elementNumber < f.elementNumber) {
                            fieldJustBeforePassword = f2;
                        }
                    }

                    if (!iconFields.includes(fieldJustBeforePassword)) {
                        iconFields.push(fieldJustBeforePassword);
                    }
                }
            }

            for (i = 0; i < iconFields.length; i++) {
                var element = getElement(iconFields[i].opid);
                if (!element.offsetHeight) {
                    continue;
                }

                var div = document.createElement('div');
                div.className = 'bitwarden-field-icon';
                div.style.cssText = 'position: absolute; z-index: 99999; width: 25px; height: ' + element.offsetHeight + 'px;' +
                    'background-position: center center; background-repeat: no-repeat; cursor: pointer;';
                div.style.backgroundImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/" +
                    "9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFfSURBVHja1JO/aoNQFMY/" +
                    "TQipkLEBFyHZM8YxU7ZAoVBcXBw69RFK3qJQkLxBxoJByBIQnCQkPoRDwERcmv/pPRcjWmtp6dQPPu/hes7v4PVcYTgc3gJ4Yb5j" +
                    "vsHP9M5sMT9V2cNkvsfvRI0emCsEGNBOv99Ht9uFIAi4XC5pZr1eT+PT6YTD4QDP8zCdTmlrQIAaRY1GA5Ik5dqcz2eeTCtZlm" +
                    "W0Wi2em6hWvUbZrlnAZDLhnUmqqnJAViL+qH8GEEWxHLBer7Hdbr8FKIrCD5ZyC4DFYgHf90uL2+02Op0OlssldwEQxzFs20YYhrl" +
                    "C+oVUaBgGoiiCZVnYbDZfnwFN2Wg0QhAE6Z6u69A0DavVCqZpYrfb5RpUer3eM61ZyHw+5wdG39xsNuE4DsbjcaGYaU+TaCc3MTeBs9" +
                    "mMFxDIdd10Gj/JJsAj82sCqV3fHI9H3rlEe+Y3us4fAgwAGf2Q/1DENX0AAAAASUVORK5CYII=')";

                document.body.insertBefore(div, document.body.lastChild);

                var icon = { element: element, icon: div };
                adjustIconPosition(icon);
                icons.push(icon);

                div.addEventListener('click', function (event) {
                    event.stopPropagation();
                    for (var i = 0; i < icons.length; i++) {
                        if (icons[i].icon == this) {
                            var rect = icons[i].element.getBoundingClientRect();
                            chrome.runtime.sendMessage({
                                command: 'bgOpenOverlayPopup',
                                data: {
                                    position: {
                                        left: rect.left,
                                        top: rect.top + rect.height + 5
                                    }
                                }
                            });
                        }
                    }
                }, false);
            }
        }
    }

    window.addEventListener('resize', function (event) {
        adjustIconPositions();
    }, false);

    function adjustIconPositions() {
        for (var i = 0; i < icons.length; i++) {
            adjustIconPosition(icons[i]);
        }
    }

    function adjustIconPosition(i) {
        var rect = i.element.getBoundingClientRect();
        i.icon.style.top = rect.top + 'px';
        i.icon.style.left = (rect.left + rect.width - 25) + 'px';
    }


    document.addEventListener('click', function (event) {
        chrome.runtime.sendMessage({ command: 'bgCloseOverlayPopup' });
    }, false);

    // ref http://stackoverflow.com/a/14570614/1090359
    var observeDOM = (function () {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
            eventListenerSupported = window.addEventListener;

        return function (obj, callback) {
            if (MutationObserver) {
                // define a new observer
                var obs = new MutationObserver(function (mutations, observer) {
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
                        callback();
                    }
                });
                // have the observer observe foo for changes in children
                obs.observe(obj, { childList: true, subtree: true });
            }
            else if (eventListenerSupported) {
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
            }
        }
    })();

    function getElement(opid) {
        if (!opid) {
            return null;
        }

        var element;
        try {
            var inputFields = Array.prototype.slice.call(document.querySelectorAll('input'));
            var opidInputFields = inputFields.filter(function (b) {
                return b.opid === opid;
            });

            if (opidInputFields.length > 0) {
                element = opidInputFields[0];

                if (opidInputFields.length > 1) {
                    console.warn('More than one element found with opid ' + opid);
                }
            }
            else {
                var index = parseInt(opid.split('__')[1], 10);
                isNaN(index) || (element = inputFields[index])
            }
        }
        catch (e) {
            console.error('An unexpected error occurred: ' + e);
        }
        finally {
            return element;
        }
    }

    /*
    1Password Extension

    Lovingly handcrafted by Dave Teare, Michael Fey, Rad Azzouz, and Roustem Karimov.
    Copyright (c) 2014 AgileBits. All rights reserved.

    ================================================================================

    Copyright (c) 2014 AgileBits Inc.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */

    function collect(document, undefined) {
        document.elementsByOPID={};document.addEventListener('input',function(c){!1!==c.a&&'input'===c.target.tagName.toLowerCase()&&(c.target.dataset['com.agilebits.onepassword.userEdited']='yes')},!0);
        function r(c,e){function b(a,g){var d=a[g];if('string'==typeof d)return d;d=a.getAttribute(g);return'string'==typeof d?d:null}function h(a,g){if(-1===['text','password'].indexOf(g.type.toLowerCase())||!(n.test(a.value)||n.test(a.htmlID)||n.test(a.htmlName)||n.test(a.placeholder)||n.test(a['label-tag'])||n.test(a['label-data'])||n.test(a['label-aria'])))return!1;if(!a.visible)return!0;if('password'==g.type.toLowerCase())return!1;var d=g.type;w(g,!0);return d!==g.type}function p(a){switch(q(a.type)){case 'checkbox':return a.checked?
        '✓':'';case 'hidden':a=a.value;if(!a||'number'!=typeof a.length)return'';254<a.length&&(a=a.substr(0,254)+'...SNIPPED');return a;default:return a.value}}function m(a){return a.options?(a=Array.prototype.slice.call(a.options).map(function(a){var d=a.text,d=d?q(d).replace(/\\s/mg,'').replace(/[~`!@$%^&*()\\-_+=:;'\"\\[\\]|\\\\,<.>\\?]/mg,''):null;return[d?d:null,a.value]}),{options:a}):null}function s(a){var c;for(a=a.parentElement||a.parentNode;a&&'td'!=q(a.tagName);)a=a.parentElement||a.parentNode;if(!a||
        void 0===a)return null;c=a.parentElement||a.parentNode;if('tr'!=c.tagName.toLowerCase())return null;c=c.previousElementSibling;if(!c||'tr'!=(c.tagName+'').toLowerCase()||c.cells&&a.cellIndex>=c.cells.length)return null;a=c.cells[a.cellIndex];a=a.textContent||a.innerText;return a=y(a)}function t(a){var g,d=[];if(a.labels&&a.labels.length&&0<a.labels.length)d=Array.prototype.slice.call(a.labels);else{a.id&&(d=d.concat(Array.prototype.slice.call(x(c,'label[for='+JSON.stringify(a.id)+']'))));if(a.name){g=
        x(c,'label[for='+JSON.stringify(a.name)+']');for(var b=0;b<g.length;b++)-1===d.indexOf(g[b])&&d.push(g[b])}for(g=a;g&&g!=c;g=g.parentNode)'label'===q(g.tagName)&&-1===d.indexOf(g)&&d.push(g)}0===d.length&&(g=a.parentNode,'dd'===g.tagName.toLowerCase()&&'dt'===g.previousElementSibling.tagName.toLowerCase()&&d.push(g.previousElementSibling));return 0<d.length?d.map(function(a){return(a.textContent||a.innerText).replace(/^\\s+/,'').replace(/\\s+$/,'').replace('\\n','').replace(/\\s{2,}/,' ')}).join(''):
        null}function f(a,c,d,b){void 0!==b&&b===d||null===d||void 0===d||(a[c]=d)}function q(a){return'string'===typeof a?a.toLowerCase():(''+a).toLowerCase()}function x(a,c){var d=[];try{d=a.querySelectorAll(c)}catch(b){}return d}var u=c.defaultView?c.defaultView:window,n=RegExp('((\\\\b|_|-)pin(\\\\b|_|-)|password|passwort|kennwort|(\\\\b|_|-)passe(\\\\b|_|-)|contraseña|senha|密码|adgangskode|hasło|wachtwoord)','i'),v=Array.prototype.slice.call(x(c,'form')).map(function(a,c){var d={},e='__form__'+c;a.opid=e;d.opid=
        e;f(d,'htmlName',b(a,'name'));f(d,'htmlID',b(a,'id'));e=b(a,'action');e=new URL(e,window.location.href);f(d,'htmlAction',e?e.href:null);f(d,'htmlMethod',b(a,'method'));return d}),F=Array.prototype.slice.call(z(c)).map(function(a,e){var d={},l='__'+e,k=-1==a.maxLength?999:a.maxLength;if(!k||'number'===typeof k&&isNaN(k))k=999;c.elementsByOPID[l]=a;a.opid=l;d.opid=l;d.elementNumber=e;f(d,'maxLength',Math.min(k,999),999);d.visible=A(a);d.viewable=B(a);f(d,'htmlID',b(a,'id'));f(d,'htmlName',b(a,'name'));
            f(d,'htmlClass',b(a,'class'));f(d,'tabindex',b(a,'tabindex'));f(d,'title',b(a,'title'));f(d,'userEdited',!!a.dataset['com.agilebits.onepassword.userEdited']);if('hidden'!=q(a.type)){f(d,'label-tag',t(a));f(d,'label-data',b(a,'data-label'));f(d,'label-aria',b(a,'aria-label'));f(d,'label-top',s(a));l=[];for(k=a;k&&k.nextSibling;){k=k.nextSibling;if(C(k))break;D(l,k)}f(d,'label-right',l.join(''));l=[];E(a,l);l=l.reverse().join('');f(d,'label-left',l);f(d,'placeholder',b(a,'placeholder'))}f(d,'rel',b(a,
            'rel'));f(d,'type',q(b(a,'type')));f(d,'value',p(a));f(d,'checked',a.checked,!1);f(d,'autoCompleteType',a.getAttribute('x-autocompletetype')||a.getAttribute('autocompletetype')||a.getAttribute('autocomplete'),'off');f(d,'disabled',a.disabled);f(d,'readonly',a.b||a.readOnly);f(d,'selectInfo',m(a));f(d,'aria-hidden','true'==a.getAttribute('aria-hidden'),!1);f(d,'aria-disabled','true'==a.getAttribute('aria-disabled'),!1);f(d,'aria-haspopup','true'==a.getAttribute('aria-haspopup'),!1);f(d,'data-unmasked',
            a.dataset.unmasked);f(d,'data-stripe',b(a,'data-stripe'));f(d,'onepasswordFieldType',a.dataset.onepasswordFieldType||a.type);f(d,'onepasswordDesignation',a.dataset.onepasswordDesignation);f(d,'onepasswordSignInUrl',a.dataset.onepasswordSignInUrl);f(d,'onepasswordSectionTitle',a.dataset.onepasswordSectionTitle);f(d,'onepasswordSectionFieldKind',a.dataset.onepasswordSectionFieldKind);f(d,'onepasswordSectionFieldTitle',a.dataset.onepasswordSectionFieldTitle);f(d,'onepasswordSectionFieldValue',a.dataset.onepasswordSectionFieldValue);
            a.form&&(d.form=b(a.form,'opid'));f(d,'fakeTested',h(d,a),!1);return d});F.filter(function(a){return a.fakeTested}).forEach(function(a){var b=c.elementsByOPID[a.opid];b.getBoundingClientRect();var d=b.value;!b||b&&'function'!==typeof b.click||b.click();w(b,!1);b.dispatchEvent(G(b,'keydown'));b.dispatchEvent(G(b,'keypress'));b.dispatchEvent(G(b,'keyup'));b.value!==d&&(b.value=d);b.click&&b.click();a.postFakeTestVisible=A(b);a.postFakeTestViewable=B(b);a.postFakeTestType=b.type;a=b.value;var d=b.ownerDocument.createEvent('HTMLEvents'),
            e=b.ownerDocument.createEvent('HTMLEvents');b.dispatchEvent(G(b,'keydown'));b.dispatchEvent(G(b,'keypress'));b.dispatchEvent(G(b,'keyup'));e.initEvent('input',!0,!0);b.dispatchEvent(e);d.initEvent('change',!0,!0);b.dispatchEvent(d);b.blur();b.value!==a&&(b.value=a)});u={documentUUID:e,title:c.title,url:u.location.href,documentUrl:c.location.href,tabUrl:u.location.href,forms:function(a){var b={};a.forEach(function(a){b[a.opid]=a});return b}(v),fields:F,collectedTimestamp:(new Date).getTime()};(v=document.querySelector('[data-onepassword-title]'))&&
            v.dataset[DISPLAY_TITLE_ATTRIBUE]&&(u.displayTitle=v.dataset.onepasswordTitle);return u};document.elementForOPID=H;function G(c,e){var b;I?(b=document.createEvent('KeyboardEvent'),b.initKeyEvent(e,!0,!1,null,!1,!1,!1,!1,0,0)):(b=c.ownerDocument.createEvent('Events'),b.initEvent(e,!0,!1),b.charCode=0,b.keyCode=0,b.which=0,b.srcElement=c,b.target=c);return b}window.LOGIN_TITLES=[/^\\W*log\\W*[oi]n\\W*$/i,/log\\W*[oi]n (?:securely|now)/i,/^\\W*sign\\W*[oi]n\\W*$/i,'continue','submit','weiter','accès','вход','connexion','entrar','anmelden','accedi','valider','登录','लॉग इन करें','change password'];
        window.LOGIN_RED_HERRING_TITLES=['already have an account','sign in with'];window.REGISTER_TITLES='register;sign up;signup;join;регистрация;inscription;regístrate;cadastre-se;registrieren;registrazione;注册;साइन अप करें'.split(';');window.SEARCH_TITLES='search find поиск найти искать recherche suchen buscar suche ricerca procurar 検索'.split(' ');window.FORGOT_PASSWORD_TITLES='forgot geändert vergessen hilfe changeemail español'.split(' ');window.REMEMBER_ME_TITLES=['remember me','rememberme','keep me signed in'];
        window.BACK_TITLES=['back','назад'];function y(c){var e=null;c&&(e=c.replace(/^\\s+|\\s+$|\\r?\\n.*$/mg,''),e=0<e.length?e:null);return e}function D(c,e){var b;b='';3===e.nodeType?b=e.nodeValue:1===e.nodeType&&(b=e.textContent||e.innerText);(b=y(b))&&c.push(b)}function C(c){var e;c&&void 0!==c?(e='select option input form textarea button table iframe body head script'.split(' '),c?(c=c?(c.tagName||'').toLowerCase():'',e=e.constructor==Array?0<=e.indexOf(c):c===e):e=!1):e=!0;return e}
        function E(c,e,b){var h;for(b||(b=0);c&&c.previousSibling;){c=c.previousSibling;if(C(c))return;D(e,c)}if(c&&0===e.length){for(h=null;!h;){c=c.parentElement||c.parentNode;if(!c)return;for(h=c.previousSibling;h&&!C(h)&&h.lastChild;)h=h.lastChild}C(h)||(D(e,h),0===e.length&&E(h,e,b+1))}}
        function A(c){var e=c;c=(c=c.ownerDocument)?c.defaultView:{};for(var b;e&&e!==document;){b=c.getComputedStyle?c.getComputedStyle(e,null):e.style;if(!b)return!0;if('none'===b.display||'hidden'==b.visibility)return!1;e=e.parentNode}return e===document}
        function B(c){var e=c.ownerDocument.documentElement,b=c.getBoundingClientRect(),h=e.scrollWidth,p=e.scrollHeight,m=b.left-e.clientLeft,e=b.top-e.clientTop,s;if(!A(c)||!c.offsetParent||10>c.clientWidth||10>c.clientHeight)return!1;var t=c.getClientRects();if(0===t.length)return!1;for(var f=0;f<t.length;f++)if(s=t[f],s.left>h||0>s.right)return!1;if(0>m||m>h||0>e||e>p)return!1;for(b=c.ownerDocument.elementFromPoint(m+(b.right>window.innerWidth?(window.innerWidth-m)/2:b.width/2),e+(b.bottom>window.innerHeight?
        (window.innerHeight-e)/2:b.height/2));b&&b!==c&&b!==document;){if(b.tagName&&'string'===typeof b.tagName&&'label'===b.tagName.toLowerCase()&&c.labels&&0<c.labels.length)return 0<=Array.prototype.slice.call(c.labels).indexOf(b);b=b.parentNode}return b===c}
        function H(c){var e;if(void 0===c||null===c)return null;try{var b=Array.prototype.slice.call(z(document)),h=b.filter(function(b){return b.opid==c});if(0<h.length)e=h[0],1<h.length&&console.warn('More than one element found with opid '+c);else{var p=parseInt(c.split('__')[1],10);isNaN(p)||(e=b[p])}}catch(m){console.error('An unexpected error occurred: '+m)}finally{return e}};var I='object'===typeof tabs||'object'===typeof self&&'object'===typeof self.port;function z(c){var e=[];try{e=c.querySelectorAll('input, select, button')}catch(b){}return e}function w(c,e){if(e){var b=c.value;c.focus();c.value!==b&&(c.value=b)}else c.focus()};
        return JSON.stringify(r(document, 'oneshotUUID'));
    }

    /*
    End 1Password Extension
    */
})();
