!(function() {
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

    // MODIFICATIONS: false out any conditions that use initKeyEvent() since it causes failures on desktop browsers

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
            v.dataset[DISPLAY_TITLE_ATTRIBUE]&&(u.displayTitle=v.dataset.onepasswordTitle);return u};document.elementForOPID=H;function G(c,e){var b;(I && false)?(b=document.createEvent('KeyboardEvent'),b.initKeyEvent(e,!0,!1,null,!1,!1,!1,!1,0,0)):(b=c.ownerDocument.createEvent('Events'),b.initEvent(e,!0,!1),b.charCode=0,b.keyCode=0,b.which=0,b.srcElement=c,b.target=c);return b}window.LOGIN_TITLES=[/^\\W*log\\W*[oi]n\\W*$/i,/log\\W*[oi]n (?:securely|now)/i,/^\\W*sign\\W*[oi]n\\W*$/i,'continue','submit','weiter','accès','вход','connexion','entrar','anmelden','accedi','valider','登录','लॉग इन करें','change password'];
        window.LOGIN_RED_HERRING_TITLES=['already have an account','sign in with'];window.REGISTER_TITLES='register;sign up;signup;join;регистрация;inscription;regístrate;cadastre-se;registrieren;registrazione;注册;साइन अप करें'.split(';');window.SEARCH_TITLES='search find поиск найти искать recherche suchen buscar suche ricerca procurar 検索'.split(' ');window.FORGOT_PASSWORD_TITLES='forgot geändert vergessen hilfe changeemail español'.split(' ');window.REMEMBER_ME_TITLES=['remember me','rememberme','keep me signed in'];
        window.BACK_TITLES=['back','назад'];function y(c){var e=null;c&&(e=c.replace(/^\\s+|\\s+$|\\r?\\n.*$/mg,''),e=0<e.length?e:null);return e}function D(c,e){var b;b='';3===e.nodeType?b=e.nodeValue:1===e.nodeType&&(b=e.textContent||e.innerText);(b=y(b))&&c.push(b)}function C(c){var e;c&&void 0!==c?(e='select option input form textarea button table iframe body head script'.split(' '),c?(c=c?(c.tagName||'').toLowerCase():'',e=e.constructor==Array?0<=e.indexOf(c):c===e):e=!1):e=!0;return e}
        function E(c,e,b){var h;for(b||(b=0);c&&c.previousSibling;){c=c.previousSibling;if(C(c))return;D(e,c)}if(c&&0===e.length){for(h=null;!h;){c=c.parentElement||c.parentNode;if(!c)return;for(h=c.previousSibling;h&&!C(h)&&h.lastChild;)h=h.lastChild}C(h)||(D(e,h),0===e.length&&E(h,e,b+1))}}
        function A(c){var e=c;c=(c=c.ownerDocument)?c.defaultView:{};for(var b;e&&e!==document;){b=c.getComputedStyle?c.getComputedStyle(e,null):e.style;if(!b)return!0;if('none'===b.display||'hidden'==b.visibility)return!1;e=e.parentNode}return e===document}
        function B(c){var e=c.ownerDocument.documentElement,b=c.getBoundingClientRect(),h=e.scrollWidth,p=e.scrollHeight,m=b.left-e.clientLeft,e=b.top-e.clientTop,s;if(!A(c)||!c.offsetParent||10>c.clientWidth||10>c.clientHeight)return!1;var t=c.getClientRects();if(0===t.length)return!1;for(var f=0;f<t.length;f++)if(s=t[f],s.left>h||0>s.right)return!1;if(0>m||m>h||0>e||e>p)return!1;for(b=c.ownerDocument.elementFromPoint(m+(b.right>window.innerWidth?(window.innerWidth-m)/2:b.width/2),e+(b.bottom>window.innerHeight?
        (window.innerHeight-e)/2:b.height/2));b&&b!==c&&b!==document;){if(b.tagName&&'string'===typeof b.tagName&&'label'===b.tagName.toLowerCase()&&c.labels&&0<c.labels.length)return 0<=Array.prototype.slice.call(c.labels).indexOf(b);b=b.parentNode}return b===c}
        function H(c){var e;if(void 0===c||null===c)return null;try{var b=Array.prototype.slice.call(z(document)),h=b.filter(function(b){return b.opid==c});if(0<h.length)e=h[0],1<h.length&&console.warn('More than one element found with opid '+c);else{var p=parseInt(c.split('__')[1],10);isNaN(p)||(e=b[p])}}catch(m){console.error('An unexpected error occurred: '+m)}finally{return e}};var I='object'===typeof tabs||'object'===typeof self&&'object'===typeof self.port;function z(c){var e=[];try{e=c.querySelectorAll('input, select, button')}catch(b){}return e}function w(c,e){if(e){var b=c.value;c.focus();c.value!==b&&(c.value=b)}else c.focus()};
        return JSON.stringify(r(document, 'oneshotUUID'));
    }

    function fill(document, fillScript, undefined) {
        var g=!0,k=!0;
        function n(a){var b=null;return a?0===a.indexOf('https://')&&'http:'===document.location.protocol&&(b=document.querySelectorAll('input[type=password]'),0<b.length&&(confirmResult=confirm('1Password warning: This is an unsecured HTTP page, and any information you submit can potentially be seen and changed by others. This Login was originally saved on a secure (HTTPS) page.\\n\\nDo you still wish to fill this login?'),0==confirmResult))?!0:!1:!1}
        function m(a){var b,c=[],d=a.properties,e=1,h,f=[];d&&d.delay_between_operations&&(e=d.delay_between_operations);if(!n(a.savedURL)){h=function(a,b){var d=a[0];if(void 0===d)b();else{if('delay'===d.operation||'delay'===d[0])e=d.parameters?d.parameters[0]:d[1];else{if(d=p(d))for(var l=0;l<d.length;l++)-1===f.indexOf(d[l])&&f.push(d[l]);c=c.concat(f.map(function(a){return a&&a.hasOwnProperty('opid')?a.opid:null}))}setTimeout(function(){h(a.slice(1),b)},e)}};if(b=a.options)b.hasOwnProperty('animate')&&
        (k=b.animate),b.hasOwnProperty('markFilling')&&(g=b.markFilling);a.itemType&&'fillPassword'===a.itemType&&(g=!1);a.hasOwnProperty('script')&&(b=a.script,h(b,function(){a.hasOwnProperty('autosubmit')&&'function'==typeof autosubmit&&(a.itemType&&'fillLogin'!==a.itemType||(0<f.length?setTimeout(function(){autosubmit(a.autosubmit,d.allow_clicky_autosubmit,f)},AUTOSUBMIT_DELAY):DEBUG_AUTOSUBMIT&&console.log('[AUTOSUBMIT] Not attempting to submit since no fields were filled: ',f)));'object'==typeof protectedGlobalPage&&
        protectedGlobalPage.a('fillItemResults',{documentUUID:documentUUID,fillContextIdentifier:a.fillContextIdentifier,usedOpids:c},function(){fillingItemType=null})}))}}var x={fill_by_opid:q,fill_by_query:r,click_on_opid:s,click_on_query:t,touch_all_fields:u,simple_set_value_by_query:v,focus_by_opid:w,delay:null};
        function p(a){var b;if(a.hasOwnProperty('operation')&&a.hasOwnProperty('parameters'))b=a.operation,a=a.parameters;else if('[object Array]'===Object.prototype.toString.call(a))b=a[0],a=a.splice(1);else return null;return x.hasOwnProperty(b)?x[b].apply(this,a):null}function q(a,b){var c;return(c=y(a))?(z(c,b),[c]):null}function r(a,b){var c;c=A(a);return Array.prototype.map.call(Array.prototype.slice.call(c),function(a){z(a,b);return a},this)}
        function v(a,b){var c,d=[];c=A(a);Array.prototype.forEach.call(Array.prototype.slice.call(c),function(a){void 0!==a.value&&(a.value=b,d.push(a))});return d}function w(a){if(a=y(a))'function'===typeof a.click&&a.click(),'function'===typeof a.focus&&B(a,!0);return null}function s(a){return(a=y(a))?C(a)?[a]:null:null}
        function t(a){a=A(a);return Array.prototype.map.call(Array.prototype.slice.call(a),function(a){C(a);'function'===typeof a.click&&a.click();'function'===typeof a.focus&&B(a,!0);return[a]},this)}function u(){D()};var E={'true':!0,y:!0,1:!0,yes:!0,'✓':!0},F=200;function z(a,b){var c;if(a&&null!==b&&void 0!==b)switch(g&&a.form&&!a.form.opfilled&&(a.form.opfilled=!0),a.type?a.type.toLowerCase():null){case 'checkbox':c=b&&1<=b.length&&E.hasOwnProperty(b.toLowerCase())&&!0===E[b.toLowerCase()];a.checked===c||G(a,function(a){a.checked=c});break;case 'radio':!0===E[b.toLowerCase()]&&a.click();break;default:a.value==b||G(a,function(a){a.value=b})}}
        function G(a,b){H(a);b(a);I(a);J(a)&&(a.className+=' com-agilebits-onepassword-extension-animated-fill',setTimeout(function(){a&&a.className&&(a.className=a.className.replace(/(\\s)?com-agilebits-onepassword-extension-animated-fill/,''))},F))};document.elementForOPID=y;function K(a,b){var c;(L && false)?(c=document.createEvent('KeyboardEvent'),c.initKeyEvent(b,!0,!1,null,!1,!1,!1,!1,0,0)):(c=a.ownerDocument.createEvent('Events'),c.initEvent(b,!0,!1),c.charCode=0,c.keyCode=0,c.which=0,c.srcElement=a,c.target=a);return c}function H(a){var b=a.value;C(a);B(a,!1);a.dispatchEvent(K(a,'keydown'));a.dispatchEvent(K(a,'keypress'));a.dispatchEvent(K(a,'keyup'));a.value!==b&&(a.value=b)}
        function I(a){var b=a.value,c=a.ownerDocument.createEvent('HTMLEvents'),d=a.ownerDocument.createEvent('HTMLEvents');a.dispatchEvent(K(a,'keydown'));a.dispatchEvent(K(a,'keypress'));a.dispatchEvent(K(a,'keyup'));d.initEvent('input',!0,!0);a.dispatchEvent(d);c.initEvent('change',!0,!0);a.dispatchEvent(c);a.blur();a.value!==b&&(a.value=b)}function C(a){if(!a||a&&'function'!==typeof a.click)return!1;a.click();return!0}
        function M(){var a=RegExp('((\\\\b|_|-)pin(\\\\b|_|-)|password|passwort|kennwort|passe|contraseña|senha|密码|adgangskode|hasło|wachtwoord)','i');return Array.prototype.slice.call(A("input[type='text']")).filter(function(b){return b.value&&a.test(b.value)},this)}function D(){M().forEach(function(a){H(a);a.click&&a.click();I(a)})}
        window.LOGIN_TITLES=[/^\\W*log\\W*[oi]n\\W*$/i,/log\\W*[oi]n (?:securely|now)/i,/^\\W*sign\\W*[oi]n\\W*$/i,'continue','submit','weiter','accès','вход','connexion','entrar','anmelden','accedi','valider','登录','लॉग इन करें','change password'];window.LOGIN_RED_HERRING_TITLES=['already have an account','sign in with'];window.REGISTER_TITLES='register;sign up;signup;join;регистрация;inscription;regístrate;cadastre-se;registrieren;registrazione;注册;साइन अप करें'.split(';');window.SEARCH_TITLES='search find поиск найти искать recherche suchen buscar suche ricerca procurar 検索'.split(' ');
        window.FORGOT_PASSWORD_TITLES='forgot geändert vergessen hilfe changeemail español'.split(' ');window.REMEMBER_ME_TITLES=['remember me','rememberme','keep me signed in'];window.BACK_TITLES=['back','назад'];
        function J(a){var b;if(b=k)a:{b=a;for(var c=a.ownerDocument,c=c?c.defaultView:{},d;b&&b!==document;){d=c.getComputedStyle?c.getComputedStyle(b,null):b.style;if(!d){b=!0;break a}if('none'===d.display||'hidden'==d.visibility){b=!1;break a}b=b.parentNode}b=b===document}return b?-1!=='email text password number tel url'.split(' ').indexOf(a.type||''):!1}
        function y(a){var b;if(void 0===a||null===a)return null;try{var c=Array.prototype.slice.call(A('input, select, button')),d=c.filter(function(b){return b.opid==a});if(0<d.length)b=d[0],1<d.length&&console.warn('More than one element found with opid '+a);else{var e=parseInt(a.split('__')[1],10);isNaN(e)||(b=c[e])}}catch(h){console.error('An unexpected error occurred: '+h)}finally{return b}};var L='object'===typeof tabs||'object'===typeof self&&'object'===typeof self.port;function A(a){var b=document,c=[];try{c=b.querySelectorAll(a)}catch(d){}return c}function B(a,b){if(b){var c=a.value;a.focus();a.value!==c&&(a.value=c)}else a.focus()};
        m(fillScript);
        return JSON.stringify({'success': true});
    }

    /*
    End 1Password Extension
    */

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'collectPageDetails') {
            var pageDetails = collect(document);
            sendResponse(JSON.parse(pageDetails));
            return true;
        }
        else if (msg.command === 'fillForm') {
            fill(document, msg.fillScript);
            sendResponse();
            return true;
        }
    });
})();
