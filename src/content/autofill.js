!(function () {
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

    /*
    MODIFICATIONS FROM ORIGINAL

    1. Populate isFirefox
    2. Remove isChrome and isSafari since they are not used.
    3. Unminify and format to meet Mozilla review requirements.
    */

    function collect(document, undefined) {
        var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('Gecko/') !== -1;

        document.elementsByOPID = {};
        document.addEventListener('input', function (canuf) {
            false !== canuf.a && 'input' === canuf.target.tagName.toLowerCase() && (canuf.target.dataset['com.agilebits.onepassword.userEdited'] = 'yes');
        }, true);

        function sasrie(theDoc, oneShotId) {
            function jihid(noosun, otab) {
                var asril = noosun[otab];
                if ('string' == typeof asril) {
                    return asril;
                }
                asril = noosun.getAttribute(otab);
                return 'string' == typeof asril ? asril : null;
            }

            function tepe(fige, nihat) {
                if (-1 === ['text', 'password'].indexOf(nihat.type.toLowerCase()) || !(passwordRegEx.test(fige.value) || passwordRegEx.test(fige.htmlID) || passwordRegEx.test(fige.htmlName) || passwordRegEx.test(fige.placeholder) || passwordRegEx.test(fige['label-tag']) || passwordRegEx.test(fige['label-data']) || passwordRegEx.test(fige['label-aria']))) {
                    return false;
                }
                if (!fige.visible) {
                    return true;
                }
                if ('password' == nihat.type.toLowerCase()) {
                    return false;
                }
                var jeko = nihat.type;
                jesceln(nihat, true);
                return jeko !== nihat.type;
            }

            function sumu(bafo) {
                switch (toLowerString(bafo.type)) {
                    case 'checkbox':
                        return bafo.checked ? '✓' : '';

                    case 'hidden':
                        bafo = bafo.value;
                        if (!bafo || 'number' != typeof bafo.length) {
                            return '';
                        }
                        254 < bafo.length && (bafo = bafo.substr(0, 254) + '...SNIPPED');
                        return bafo;

                    default:
                        return bafo.value;
                }
            }

            function muri(goofu) {
                return goofu.options ? (goofu = Array.prototype.slice.call(goofu.options).map(function (luebi) {
                    var cituen = luebi.text, cituen = cituen ? toLowerString(cituen).replace(/\\s/gm, '').replace(/[~`!@$%^&*()\\-_+=:;'\"\\[\\]|\\\\,<.>\\?]/gm, '') : null;
                    return [cituen ? cituen : null, luebi.value];
                }), {
                    options: goofu
                }) : null;
            }

            function cobu(mickuf) {
                var rana;
                for (mickuf = mickuf.parentElement || mickuf.parentNode; mickuf && 'td' != toLowerString(mickuf.tagName) ;) {
                    mickuf = mickuf.parentElement || mickuf.parentNode;
                }
                if (!mickuf || void 0 === mickuf) {
                    return null;
                }
                rana = mickuf.parentElement || mickuf.parentNode;
                if ('tr' != rana.tagName.toLowerCase()) {
                    return null;
                }
                rana = rana.previousElementSibling;
                if (!rana || 'tr' != (rana.tagName + '').toLowerCase() || rana.cells && mickuf.cellIndex >= rana.cells.length) {
                    return null;
                }
                mickuf = rana.cells[mickuf.cellIndex];
                mickuf = mickuf.textContent || mickuf.innerText;
                return mickuf = loopi(mickuf);
            }

            function kasu(prifue) {
                var jefu, hage = [];
                if (prifue.labels && prifue.labels.length && 0 < prifue.labels.length) {
                    hage = Array.prototype.slice.call(prifue.labels);
                } else {
                    prifue.id && (hage = hage.concat(Array.prototype.slice.call(queryDoc(theDoc, 'label[for=' + JSON.stringify(prifue.id) + ']'))));
                    if (prifue.name) {
                        jefu = queryDoc(theDoc, 'label[for=' + JSON.stringify(prifue.name) + ']');
                        for (var dilaf = 0; dilaf < jefu.length; dilaf++) {
                            -1 === hage.indexOf(jefu[dilaf]) && hage.push(jefu[dilaf]);
                        }
                    }
                    for (jefu = prifue; jefu && jefu != theDoc; jefu = jefu.parentNode) {
                        'label' === toLowerString(jefu.tagName) && -1 === hage.indexOf(jefu) && hage.push(jefu);
                    }
                }
                0 === hage.length && (jefu = prifue.parentNode, 'dd' === jefu.tagName.toLowerCase() && null !== jefu.previousElementSibling && 'dt' === jefu.previousElementSibling.tagName.toLowerCase() && hage.push(jefu.previousElementSibling));
                return 0 < hage.length ? hage.map(function (noquo) {
                    return (noquo.textContent || noquo.innerText).replace(/^\\s+/, '').replace(/\\s+$/, '').replace('\\n', '').replace(/\\s{2,}/, ' ');
                }).join('') : null;
            }

            function etit(kisa, puju, lofes, aynem) {
                void 0 !== aynem && aynem === lofes || null === lofes || void 0 === lofes || (kisa[puju] = lofes);
            }

            function toLowerString(s) {
                return 'string' === typeof s ? s.toLowerCase() : ('' + s).toLowerCase();
            }

            function queryDoc(doc, query) {
                var els = [];
                try {
                    els = doc.querySelectorAll(query);
                } catch (e) { }
                return els;
            }

            var theView = theDoc.defaultView ? theDoc.defaultView : window,
                passwordRegEx = RegExp('((\\\\b|_|-)pin(\\\\b|_|-)|password|passwort|kennwort|(\\\\b|_|-)passe(\\\\b|_|-)|contraseña|senha|密码|adgangskode|hasło|wachtwoord)', 'i');

            var theTitle = Array.prototype.slice.call(queryDoc(theDoc, 'form')).map(function (formEl, elIndex) {
                var op = {},
                    formOpId = '__form__' + elIndex;

                formEl.opid = formOpId;
                op.opid = formOpId;
                etit(op, 'htmlName', jihid(formEl, 'name'));
                etit(op, 'htmlID', jihid(formEl, 'id'));
                formOpId = jihid(formEl, 'action');
                formOpId = new URL(formOpId, window.location.href);
                etit(op, 'htmlAction', formOpId ? formOpId.href : null);
                etit(op, 'htmlMethod', jihid(formEl, 'method'));

                return op;
            });

            var theFields = Array.prototype.slice.call(getFormElements(theDoc)).map(function (tadkak, shoho) {
                var neref = {}, bosna = '__' + shoho, steyquif = -1 == tadkak.maxLength ? 999 : tadkak.maxLength;
                if (!steyquif || 'number' === typeof steyquif && isNaN(steyquif)) {
                    steyquif = 999;
                }
                theDoc.elementsByOPID[bosna] = tadkak;
                tadkak.opid = bosna;
                neref.opid = bosna;
                neref.elementNumber = shoho;
                etit(neref, 'maxLength', Math.min(steyquif, 999), 999);
                neref.visible = ciquod(tadkak);
                neref.viewable = blekey(tadkak);
                etit(neref, 'htmlID', jihid(tadkak, 'id'));
                etit(neref, 'htmlName', jihid(tadkak, 'name'));
                etit(neref, 'htmlClass', jihid(tadkak, 'class'));
                etit(neref, 'tabindex', jihid(tadkak, 'tabindex'));
                etit(neref, 'title', jihid(tadkak, 'title'));
                etit(neref, 'userEdited', !!tadkak.dataset['com.agilebits.onepassword.userEdited']);

                if ('hidden' != toLowerString(tadkak.type)) {
                    etit(neref, 'label-tag', kasu(tadkak));
                    etit(neref, 'label-data', jihid(tadkak, 'data-label'));
                    etit(neref, 'label-aria', jihid(tadkak, 'aria-label'));
                    etit(neref, 'label-top', cobu(tadkak));
                    bosna = [];
                    for (steyquif = tadkak; steyquif && steyquif.nextSibling;) {
                        steyquif = steyquif.nextSibling;
                        if (quernaln(steyquif)) {
                            break;
                        }
                        queka(bosna, steyquif);
                    }
                    etit(neref, 'label-right', bosna.join(''));
                    bosna = [];
                    bozoum(tadkak, bosna);
                    bosna = bosna.reverse().join('');
                    etit(neref, 'label-left', bosna);
                    etit(neref, 'placeholder', jihid(tadkak, 'placeholder'));
                }

                etit(neref, 'rel', jihid(tadkak, 'rel'));
                etit(neref, 'type', toLowerString(jihid(tadkak, 'type')));
                etit(neref, 'value', sumu(tadkak));
                etit(neref, 'checked', tadkak.checked, false);
                etit(neref, 'autoCompleteType', tadkak.getAttribute('x-autocompletetype') || tadkak.getAttribute('autocompletetype') || tadkak.getAttribute('autocomplete'), 'off');
                etit(neref, 'disabled', tadkak.disabled);
                etit(neref, 'readonly', tadkak.b || tadkak.readOnly);
                etit(neref, 'selectInfo', muri(tadkak));
                etit(neref, 'aria-hidden', 'true' == tadkak.getAttribute('aria-hidden'), false);
                etit(neref, 'aria-disabled', 'true' == tadkak.getAttribute('aria-disabled'), false);
                etit(neref, 'aria-haspopup', 'true' == tadkak.getAttribute('aria-haspopup'), false);
                etit(neref, 'data-unmasked', tadkak.dataset.unmasked);
                etit(neref, 'data-stripe', jihid(tadkak, 'data-stripe'));
                etit(neref, 'onepasswordFieldType', tadkak.dataset.onepasswordFieldType || tadkak.type);
                etit(neref, 'onepasswordDesignation', tadkak.dataset.onepasswordDesignation);
                etit(neref, 'onepasswordSignInUrl', tadkak.dataset.onepasswordSignInUrl);
                etit(neref, 'onepasswordSectionTitle', tadkak.dataset.onepasswordSectionTitle);
                etit(neref, 'onepasswordSectionFieldKind', tadkak.dataset.onepasswordSectionFieldKind);
                etit(neref, 'onepasswordSectionFieldTitle', tadkak.dataset.onepasswordSectionFieldTitle);
                etit(neref, 'onepasswordSectionFieldValue', tadkak.dataset.onepasswordSectionFieldValue);
                tadkak.form && (neref.form = jihid(tadkak.form, 'opid'));
                etit(neref, 'fakeTested', tepe(neref, tadkak), false);

                return neref;
            });

            theFields.filter(function (hefik) {
                return hefik.fakeTested;
            }).forEach(function (kukip) {
                var cisuf = theDoc.elementsByOPID[kukip.opid];
                cisuf.getBoundingClientRect();
                var jeechgan = cisuf.value;
                !cisuf || cisuf && 'function' !== typeof cisuf.click || cisuf.click();
                jesceln(cisuf, false);
                cisuf.dispatchEvent(guna(cisuf, 'keydown'));
                cisuf.dispatchEvent(guna(cisuf, 'keypress'));
                cisuf.dispatchEvent(guna(cisuf, 'keyup'));
                cisuf.value !== jeechgan && (cisuf.value = jeechgan);
                cisuf.click && cisuf.click();
                kukip.postFakeTestVisible = ciquod(cisuf);
                kukip.postFakeTestViewable = blekey(cisuf);
                kukip.postFakeTestType = cisuf.type;
                kukip = cisuf.value;
                var jeechgan = cisuf.ownerDocument.createEvent('HTMLEvents'), jalue = cisuf.ownerDocument.createEvent('HTMLEvents');
                cisuf.dispatchEvent(guna(cisuf, 'keydown'));
                cisuf.dispatchEvent(guna(cisuf, 'keypress'));
                cisuf.dispatchEvent(guna(cisuf, 'keyup'));
                jalue.initEvent('input', true, true);
                cisuf.dispatchEvent(jalue);
                jeechgan.initEvent('change', true, true);
                cisuf.dispatchEvent(jeechgan);
                cisuf.blur();
                cisuf.value !== kukip && (cisuf.value = kukip);
            });

            var pageDetails = {
                documentUUID: oneShotId,
                title: theDoc.title,
                url: theView.location.href,
                documentUrl: theDoc.location.href,
                tabUrl: theView.location.href,
                forms: function (basas) {
                    var histstap = {};
                    basas.forEach(function (quavu) {
                        histstap[quavu.opid] = quavu;
                    });
                    return histstap;
                }(theTitle),
                fields: theFields,
                collectedTimestamp: new Date().getTime()
            };

            // get proper page title. maybe they are using the special meta tag?
            theTitle = document.querySelector('[data-onepassword-title]')
            if (theTitle && theTitle.dataset[DISPLAY_TITLE_ATTRIBUE]) {
                pageDetails.displayTitle = theTitle.dataset.onepasswordTitle;
            }

            return pageDetails;
        }

        document.elementForOPID = jasu;

        function guna(kedol, fonor) {
            var quebo;
            isFirefox ? (quebo = document.createEvent('KeyboardEvent'), quebo.initKeyEvent(fonor, true, false, null, false, false, false, false, 0, 0)) : (quebo = kedol.ownerDocument.createEvent('Events'),
            quebo.initEvent(fonor, true, false), quebo.charCode = 0, quebo.keyCode = 0, quebo.which = 0,
            quebo.srcElement = kedol, quebo.target = kedol);
            return quebo;
        }

        window.LOGIN_TITLES = [/^\\W*log\\W*[oi]n\\W*$/i, /log\\W*[oi]n (?:securely|now)/i, /^\\W*sign\\W*[oi]n\\W*$/i, 'continue', 'submit', 'weiter', 'accès', 'вход', 'connexion', 'entrar', 'anmelden', 'accedi', 'valider', '登录', 'लॉग इन करें', 'change password'];
        window.LOGIN_RED_HERRING_TITLES = ['already have an account', 'sign in with'];
        window.REGISTER_TITLES = 'register;sign up;signup;join;create my account;регистрация;inscription;regístrate;cadastre-se;registrieren;registrazione;注册;साइन अप करें'.split(';');
        window.SEARCH_TITLES = 'search find поиск найти искать recherche suchen buscar suche ricerca procurar 検索'.split(' ');
        window.FORGOT_PASSWORD_TITLES = 'forgot geändert vergessen hilfe changeemail español'.split(' ');
        window.REMEMBER_ME_TITLES = ['remember me', 'rememberme', 'keep me signed in'];
        window.BACK_TITLES = ['back', 'назад'];

        function loopi(segu) {
            var bitou = null;
            segu && (bitou = segu.replace(/^\\s+|\\s+$|\\r?\\n.*$/gm, ''), bitou = 0 < bitou.length ? bitou : null);
            return bitou;
        }

        function queka(tigap, niela) {
            var jahe;
            jahe = '';
            3 === niela.nodeType ? jahe = niela.nodeValue : 1 === niela.nodeType && (jahe = niela.textContent || niela.innerText);
            (jahe = loopi(jahe)) && tigap.push(jahe);
        }

        function quernaln(ukag) {
            var relu;
            ukag && void 0 !== ukag ? (relu = 'select option input form textarea button table iframe body head script'.split(' '),
            ukag ? (ukag = ukag ? (ukag.tagName || '').toLowerCase() : '', relu = relu.constructor == Array ? 0 <= relu.indexOf(ukag) : ukag === relu) : relu = false) : relu = true;
            return relu;
        }

        function bozoum(edpuk, uday, siru) {
            var quoto;
            for (siru || (siru = 0) ; edpuk && edpuk.previousSibling;) {
                edpuk = edpuk.previousSibling;
                if (quernaln(edpuk)) {
                    return;
                }
                queka(uday, edpuk);
            }
            if (edpuk && 0 === uday.length) {
                for (quoto = null; !quoto;) {
                    edpuk = edpuk.parentElement || edpuk.parentNode;
                    if (!edpuk) {
                        return;
                    }
                    for (quoto = edpuk.previousSibling; quoto && !quernaln(quoto) && quoto.lastChild;) {
                        quoto = quoto.lastChild;
                    }
                }
                quernaln(quoto) || (queka(uday, quoto), 0 === uday.length && bozoum(quoto, uday, siru + 1));
            }
        }

        function ciquod(hieku) {
            var liji = hieku;
            hieku = (hieku = hieku.ownerDocument) ? hieku.defaultView : {};
            for (var teesi; liji && liji !== document;) {
                teesi = hieku.getComputedStyle ? hieku.getComputedStyle(liji, null) : liji.style;
                if (!teesi) {
                    return true;
                }
                if ('none' === teesi.display || 'hidden' == teesi.visibility) {
                    return false;
                }
                liji = liji.parentNode;
            }
            return liji === document;
        }

        function blekey(coufi) {
            var pudu = coufi.ownerDocument.documentElement, muma = coufi.getBoundingClientRect(), gubuech = pudu.scrollWidth, kosri = pudu.scrollHeight, quophe = muma.left - pudu.clientLeft, pudu = muma.top - pudu.clientTop, temton;
            if (!ciquod(coufi) || !coufi.offsetParent || 10 > coufi.clientWidth || 10 > coufi.clientHeight) {
                return false;
            }
            var aley = coufi.getClientRects();
            if (0 === aley.length) {
                return false;
            }
            for (var sehi = 0; sehi < aley.length; sehi++) {
                if (temton = aley[sehi], temton.left > gubuech || 0 > temton.right) {
                    return false;
                }
            }
            if (0 > quophe || quophe > gubuech || 0 > pudu || pudu > kosri) {
                return false;
            }
            for (muma = coufi.ownerDocument.elementFromPoint(quophe + (muma.right > window.innerWidth ? (window.innerWidth - quophe) / 2 : muma.width / 2), pudu + (muma.bottom > window.innerHeight ? (window.innerHeight - pudu) / 2 : muma.height / 2)) ; muma && muma !== coufi && muma !== document;) {
                if (muma.tagName && 'string' === typeof muma.tagName && 'label' === muma.tagName.toLowerCase() && coufi.labels && 0 < coufi.labels.length) {
                    return 0 <= Array.prototype.slice.call(coufi.labels).indexOf(muma);
                }
                muma = muma.parentNode;
            }
            return muma === coufi;
        }

        function jasu(sebe) {
            var jutuem;
            if (void 0 === sebe || null === sebe) {
                return null;
            }
            try {
                var paraf = Array.prototype.slice.call(getFormElements(document)), viehi = paraf.filter(function (strukou) {
                    return strukou.opid == sebe;
                });
                if (0 < viehi.length) {
                    jutuem = viehi[0], 1 < viehi.length && console.warn('More than one element found with opid ' + sebe);
                } else {
                    var jotun = parseInt(sebe.split('__')[1], 10);
                    isNaN(jotun) || (jutuem = paraf[jotun]);
                }
            } catch (beynad) {
                console.error('An unexpected error occurred: ' + beynad);
            } finally {
                return jutuem;
            }
        }

        // get all the form elements that we care about
        function getFormElements(theDoc) {
            var els = [];
            try {
                els = theDoc.querySelectorAll('input, select, button');
            } catch (e) { }
            return els;
        }

        function jesceln(calo, noru) {
            if (noru) {
                var klebup = calo.value;
                calo.focus();
                calo.value !== klebup && (calo.value = klebup);
            } else {
                calo.focus();
            }
        }

        return JSON.stringify(sasrie(document, 'oneshotUUID'));
    }

    function fill(document, fillScript, undefined) {
        var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('Gecko/') !== -1;

        var markTheFilling = true,
            animateTheFilling = true;

        // Check if URL is not secure when the original saved one was
        function urlNotSecure(savedURL) {
            var passwordInputs = null;
            if (!savedURL) {
                return false;
            }

            return 0 === savedURL.indexOf('https://') && 'http:' === document.location.protocol && (passwordInputs = document.querySelectorAll('input[type=password]'),
            0 < passwordInputs.length && (confirmResult = confirm('Warning: This is an unsecured HTTP page, and any information you submit can potentially be seen and changed by others. This Login was originally saved on a secure (HTTPS) page.\\n\\nDo you still wish to fill this login?'),
            0 == confirmResult)) ? true : false;
        }

        function doFill(fillScript) {
            var fillScriptOps,
                theOpIds = [],
                fillScriptProperties = fillScript.properties,
                operationDelayMs = 1,
                doOperation,
                operationsToDo = [];

            fillScriptProperties &&
            fillScriptProperties.delay_between_operations &&
            (operationDelayMs = fillScriptProperties.delay_between_operations);

            if (urlNotSecure(fillScript.savedURL)) {
                return;
            }

            doOperation = function (ops, theOperation) {
                var op = ops[0];
                if (void 0 === op) {
                    theOperation();
                } else {
                    // should we delay?
                    if ('delay' === op.operation || 'delay' === op[0]) {
                        operationDelayMs = op.parameters ? op.parameters[0] : op[1];
                    } else {
                        if (op = normalizeOp(op)) {
                            for (var opIndex = 0; opIndex < op.length; opIndex++) {
                                -1 === operationsToDo.indexOf(op[opIndex]) && operationsToDo.push(op[opIndex]);
                            }
                        }
                        theOpIds = theOpIds.concat(operationsToDo.map(function (operationToDo) {
                            return operationToDo && operationToDo.hasOwnProperty('opid') ? operationToDo.opid : null;
                        }));
                    }
                    setTimeout(function () {
                        doOperation(ops.slice(1), theOperation);
                    }, operationDelayMs);
                }
            };

            if (fillScriptOps = fillScript.options) {
                fillScriptOps.hasOwnProperty('animate') && (animateTheFilling = fillScriptOps.animate),
                fillScriptOps.hasOwnProperty('markFilling') && (markTheFilling = fillScriptOps.markFilling);
            }

            // don't mark a password filling
            fillScript.itemType && 'fillPassword' === fillScript.itemType && (markTheFilling = false);

            if (!fillScript.hasOwnProperty('script')) {
                return;
            }

            // custom fill script

            fillScriptOps = fillScript.script;
            doOperation(fillScriptOps, function () {
                // Done now
                // Do we have anything to autosubmit?
                if (fillScript.hasOwnProperty('autosubmit') && 'function' == typeof autosubmit) {
                    fillScript.itemType && 'fillLogin' !== fillScript.itemType || (0 < operationsToDo.length ? setTimeout(function () {
                        autosubmit(fillScript.autosubmit, fillScriptProperties.allow_clicky_autosubmit, operationsToDo);
                    }, AUTOSUBMIT_DELAY) : DEBUG_AUTOSUBMIT && console.log('[AUTOSUBMIT] Not attempting to submit since no fields were filled: ', operationsToDo))
                }

                // handle protectedGlobalPage
                if ('object' == typeof protectedGlobalPage) {
                    protectedGlobalPage.b('fillItemResults', {
                        documentUUID: documentUUID,
                        fillContextIdentifier: fillScript.fillContextIdentifier,
                        usedOpids: theOpIds
                    }, function () {
                        fillingItemType = null;
                    })
                }
            });
        }

        // fill for reference
        var thisFill = {
            fill_by_opid: doFillByOpId,
            fill_by_query: doFillByQuery,
            click_on_opid: doClickByOpId,
            click_on_query: doClickByQuery,
            touch_all_fields: touchAllFields,
            simple_set_value_by_query: doSimpleSetByQuery,
            focus_by_opid: doFocusByOpId,
            delay: null
        };

        // normalize the op versus the reference
        function normalizeOp(op) {
            var thisOperation;
            if (op.hasOwnProperty('operation') && op.hasOwnProperty('parameters')) {
                thisOperation = op.operation, op = op.parameters;
            } else {
                if ('[object Array]' === Object.prototype.toString.call(op)) {
                    thisOperation = op[0],
                    op = op.splice(1);
                } else {
                    return null;
                }
            }
            return thisFill.hasOwnProperty(thisOperation) ? thisFill[thisOperation].apply(this, op) : null;
        }

        // do a fill by opid operation
        function doFillByOpId(opId, op) {
            var el = getElementByOpId(opId);
            return el ? (fillTheElement(el, op), [el]) : null;
        }

        // do a fill by query operation
        function doFillByQuery(query, op) {
            var elements = selectAllFromDoc(query);
            return Array.prototype.map.call(Array.prototype.slice.call(elements), function (el) {
                fillTheElement(el, op);
                return el;
            }, this);
        }

        // do a simple set value by query
        function doSimpleSetByQuery(query, valueToSet) {
            var elements = selectAllFromDoc(query),
                arr = [];
            Array.prototype.forEach.call(Array.prototype.slice.call(elements), function (el) {
                el.disabled || el.a || el.readOnly || void 0 === el.value || (el.value = valueToSet, arr.push(el));
            });
            return arr;
        }

        // focus by opid
        function doFocusByOpId(opId) {
            var el = getElementByOpId(opId)
            if (el) {
                'function' === typeof el.click && el.click(),
                'function' === typeof el.focus && doFocusElement(el, true);
            }

            return null;
        }

        // do a click by opid operation
        function doClickByOpId(opId) {
            var el = getElementByOpId(opId);
            return el ? clickElement(el) ? [el] : null : null;
        }

        // do a click by query operation
        function doClickByQuery(query) {
            query = selectAllFromDoc(query);
            return Array.prototype.map.call(Array.prototype.slice.call(query), function (el) {
                clickElement(el);
                'function' === typeof el.click && el.click();
                'function' === typeof el.focus && doFocusElement(el, true);
                return [el];
            }, this);
        }

        var checkRadioTrueOps = {
            'true': true,
            y: true,
            1: true,
            yes: true,
            '✓': true
        },
        styleTimeout = 200;

        // fill an element
        function fillTheElement(el, op) {
            var shouldCheck;
            if (el && null !== op && void 0 !== op && !(el.disabled || el.a || el.readOnly)) {
                switch (markTheFilling && el.form && !el.form.opfilled && (el.form.opfilled = true),
                el.type ? el.type.toLowerCase() : null) {
                    case 'checkbox':
                        shouldCheck = op && 1 <= op.length && checkRadioTrueOps.hasOwnProperty(op.toLowerCase()) && true === checkRadioTrueOps[op.toLowerCase()];
                        el.checked === shouldCheck || doAllFillOperations(el, function (theEl) {
                            theEl.checked = shouldCheck;
                        });
                        break;
                    case 'radio':
                        true === checkRadioTrueOps[op.toLowerCase()] && el.click();
                        break;
                    default:
                        el.value == op || doAllFillOperations(el, function (theEl) {
                            theEl.value = op;
                        });
                }
            }
        }

        // do all the full operations needed
        function doAllFillOperations(el, afterValSetFunc) {
            setValueForElement(el);
            afterValSetFunc(el);
            setValueForElementByEvent(el);
            canSeeElementToStyle(el) && (el.className += ' com-agilebits-onepassword-extension-animated-fill',
            setTimeout(function () {
                el && el.className && (el.className = el.className.replace(/(\\s)?com-agilebits-onepassword-extension-animated-fill/, ''));
            }, styleTimeout));
        }

        document.elementForOPID = getElementByOpId;

        // normalize the event since firefox handles events differently than others
        function normalizeEvent(el, eventName) {
            var ev;
            if (isFirefox) {
                ev = document.createEvent('KeyboardEvent');
                ev.initKeyEvent(eventName, true, false, null, false, false, false, false, 0, 0);
            }
            else {
                ev = el.ownerDocument.createEvent('Events');
                ev.initEvent(eventName, true, false);
                ev.charCode = 0;
                ev.keyCode = 0;
                ev.which = 0;
                ev.srcElement = el;
                ev.target = el;
            }

            return ev;
        }

        // set value of the given element
        function setValueForElement(el) {
            var valueToSet = el.value;
            clickElement(el);
            doFocusElement(el, false);
            el.dispatchEvent(normalizeEvent(el, 'keydown'));
            el.dispatchEvent(normalizeEvent(el, 'keypress'));
            el.dispatchEvent(normalizeEvent(el, 'keyup'));
            el.value !== valueToSet && (el.value = valueToSet);
        }

        // set value of the given element by using events
        function setValueForElementByEvent(el) {
            var valueToSet = el.value,
                ev1 = el.ownerDocument.createEvent('HTMLEvents'),
                ev2 = el.ownerDocument.createEvent('HTMLEvents');

            el.dispatchEvent(normalizeEvent(el, 'keydown'));
            el.dispatchEvent(normalizeEvent(el, 'keypress'));
            el.dispatchEvent(normalizeEvent(el, 'keyup'));
            ev2.initEvent('input', true, true);
            el.dispatchEvent(ev2);
            ev1.initEvent('change', true, true);
            el.dispatchEvent(ev1);
            el.blur();
            el.value !== valueToSet && (el.value = valueToSet);
        }

        // click on an element
        function clickElement(el) {
            if (!el || el && 'function' !== typeof el.click) {
                return false;
            }
            el.click();
            return true;
        }

        // get all fields we care about
        function getAllFields() {
            var r = RegExp('((\\\\b|_|-)pin(\\\\b|_|-)|password|passwort|kennwort|passe|contraseña|senha|密码|adgangskode|hasło|wachtwoord)', 'i');
            return Array.prototype.slice.call(selectAllFromDoc("input[type='text']")).filter(function (el) {
                return el.value && r.test(el.value);
            }, this);
        }

        // touch all the fields
        function touchAllFields() {
            getAllFields().forEach(function (el) {
                setValueForElement(el);
                el.click && el.click();
                setValueForElementByEvent(el);
            });
        }

        // some useful globals
        window.LOGIN_TITLES = [/^\\W*log\\W*[oi]n\\W*$/i, /log\\W*[oi]n (?:securely|now)/i, /^\\W*sign\\W*[oi]n\\W*$/i, 'continue', 'submit', 'weiter', 'accès', 'вход', 'connexion', 'entrar', 'anmelden', 'accedi', 'valider', '登录', 'लॉग इन करें', 'change password'];
        window.LOGIN_RED_HERRING_TITLES = ['already have an account', 'sign in with'];
        window.REGISTER_TITLES = 'register;sign up;signup;join;create my account;регистрация;inscription;regístrate;cadastre-se;registrieren;registrazione;注册;साइन अप करें'.split(';');
        window.SEARCH_TITLES = 'search find поиск найти искать recherche suchen buscar suche ricerca procurar 検索'.split(' ');
        window.FORGOT_PASSWORD_TITLES = 'forgot geändert vergessen hilfe changeemail español'.split(' ');
        window.REMEMBER_ME_TITLES = ['remember me', 'rememberme', 'keep me signed in'];
        window.BACK_TITLES = ['back', 'назад'];

        // can we see the element to apply some styling?
        function canSeeElementToStyle(el) {
            var currentEl;
            if (currentEl = animateTheFilling) {
                a: {
                    currentEl = el;
                    for (var owner = el.ownerDocument, owner = owner ? owner.defaultView : {}, theStyle; currentEl && currentEl !== document;) {
                        theStyle = owner.getComputedStyle ? owner.getComputedStyle(currentEl, null) : currentEl.style;
                        if (!theStyle) {
                            currentEl = true;
                            break a;
                        }
                        if ('none' === theStyle.display || 'hidden' == theStyle.visibility) {
                            currentEl = false;
                            break a;
                        }
                        currentEl = currentEl.parentNode;
                    }
                    currentEl = currentEl === document;
                }
            }
            return currentEl ? -1 !== 'email text password number tel url'.split(' ').indexOf(el.type || '') : false;
        }

        // find the element for this operation
        function getElementByOpId(theOpId) {
            var theElement;
            if (void 0 === theOpId || null === theOpId) {
                return null;
            }
            try {
                var elements = Array.prototype.slice.call(selectAllFromDoc('input, select, button'));
                var filteredElements = elements.filter(function (o) {
                    return o.opid == theOpId;
                });
                if (0 < filteredElements.length) {
                    theElement = filteredElements[0],
                    1 < filteredElements.length && console.warn('More than one element found with opid ' + theOpId);
                } else {
                    var elIndex = parseInt(theOpId.split('__')[1], 10);
                    isNaN(elIndex) || (theElement = elements[elIndex]);
                }
            } catch (e) {
                console.error('An unexpected error occurred: ' + e);
            } finally {
                return theElement;
            }
        }

        // helper for doc.querySelectorAll
        function selectAllFromDoc(theSelector) {
            var d = document, elements = [];
            try {
                elements = d.querySelectorAll(theSelector);
            } catch (e) { }
            return elements;
        }

        // focus an element and optionally re-set its value after focusing
        function doFocusElement(el, setValue) {
            if (setValue) {
                var existingValue = el.value;
                el.focus();
                el.value !== existingValue && (el.value = existingValue);
            } else {
                el.focus();
            }
        }

        doFill(fillScript);

        return JSON.stringify({
            success: true
        });
    }

    /*
    End 1Password Extension
    */

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.command === 'collectPageDetails') {
            var pageDetails = collect(document);
            var pageDetailsObj = JSON.parse(pageDetails);
            chrome.runtime.sendMessage({
                command: 'collectPageDetailsResponse',
                tabId: msg.tabId,
                details: pageDetailsObj,
                contentScript: msg.contentScript ? true : false
            });
            sendResponse();
            return true;
        }
        else if (msg.command === 'fillForm') {
            fill(document, msg.fillScript);
            sendResponse();
            return true;
        }
    });
})();
