/*
=========================================================
Name			:	InsertArg (ia)
Version			:	1.4
Last Update		:	9/4/2020
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/InsertArg
Roll20 Contact	:	timmaugh
=========================================================

*/
const ia = (() => {

    // ==================================================
    //		VERSION
    // ==================================================
    const vrs = '1.4';
    const vd = new Date(1599233215930);
    const versionInfo = () => {
        log('\u0166\u0166 InsertArg v' + vrs + ', ' + vd.getFullYear() + '/' + (vd.getMonth() + 1) + '/' + vd.getDate() + ' \u0166\u0166');
        return;
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '   ‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗    ' + '\n' +
                '    ∖_______________________________________∕     ' + '\n' +
                '      ∖___________________________________∕       ' + '\n' +
                '           ___┃ ┃_______________┃ ┃___            ' + '\n' +
                '          ┃___   _______________   ___┃           ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '______________┃ ┃_______________┃ ┃_______________' + '\n' +
                '             ⎞⎞⎛⎛            ⎞⎞⎛⎛      ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    // ==================================================
    //		TABLES AND TEMPLATES
    // ==================================================
    const elemSplitter = { outer: '&diam;&diam;', inner: '&diam;' };
    const htmlTable = {
        "&": "&amp;",
        "{": "&#123;",
        "}": "&#125;",
        "|": "&#124;",
        ",": "&#44;",
        "%": "&#37;",
        "?": "&#63;",
        "[": "&#91;",
        "]": "&#93;",
        "@": "&#64;",
        "~": "&#126;",
        "(": "&#40;",
        ")": "&#41;",
        "<": "&#60;",
        ">": "&#62;",
    };
    const intCallTable = {
        '--': '☰',
        '{{': '〈〈',
        '!!': '¡¡',
        '}}': '〉〉'
    }
    const rowbg = ["#ffffff", "#dedede"];
    const bgcolor = "#ce0f69";
    const menutable = '<div style="width:100%;font-family:Arial, Calibri, Consolas, cursive; font-size:12px;"><div style="border-radius:10px;background-color:maincolor; overflow:hidden;"><div style="width:100%;overflow:hidden;"><div style="font-size: 1.8em; line-height:24px; color: maintextcolor;text-align:left;width:95%; margin:auto;padding:4px;">title</div></div>row<div style="line-height:10px;">&nbsp;</div></div></div>';
    const menurow = '<div style="background-color:altcolor;color:alttextcolor;border:solid maincolor_nooverride; border-width: 0px 1px;display:block;overflow:hidden;"><div style="width:95%;margin:4px auto; overflow: hidden;"><div style="float:left;width:100%;display:inline-block;font-weight:bold;font-size:1.25em;">title</div><div style="float:left;width:100%;display:inline-block;">rowsource</div></div></div>';
    const menuelem = '<div style="background-color:altcolor;color:alttextcolor;border:solid maincolor; border-width: 0px 1px;display:block;overflow:hidden;"><div style="width:95%;margin:1px auto 0px; overflow: visible;"><div style="float:left;display:inline-block;">title</div><div style="float:right;display:inline-block;text-align:right;">rowsource</div></div></div>';
    const msgtable = '<div style="width:100%;"><div style="border-radius:10px;border:2px solid #000000;background-color:__bg__; margin-right:16px; overflow:hidden;"><table style="width:100%; margin: 0 auto; border-collapse:collapse;font-size:12px;">__TABLE-ROWS__</table></div></div>';
    const msg1header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td></tr>';
    const msg2header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td><td style="border-left:1px solid #000000;">__cell2__</td></tr>';
    const msg3header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td><td style="border-left:1px solid #000000;">__cell2__</td><td style="border-left:1px solid #000000;">__cell3__</td></tr>';
    const msg1row = '<tr style="background-color:__bg__;"><td style="padding:4px;__row-css__">__cell1__</td></tr>';
    const msg2row = '<tr style="background-color:__bg__;font-weight:bold;"><td style="padding:1px 4px;">__cell1__</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">__cell2__</td></tr>';
    const msg3row = '<tr style="background-color:__bg__;font-weight:bold;"><td style="padding:1px 4px;">__cell1__</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">__cell2__</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">__cell3__</td></tr>';

    // ==================================================
    //		UTILITIES
    // ==================================================
    const getTheSpeaker = function (msg) {
        var characters = findObjs({ type: 'character' });
        var speaking;
        characters.forEach((chr) => { if (chr.get('name') === msg.who) speaking = chr; });

        if (speaking) {
            speaking.speakerType = "character";
            speaking.localName = speaking.get("name");
        } else {
            speaking = getObj('player', msg.playerid);
            speaking.speakerType = "player";
            speaking.localName = speaking.get("displayname");
        }
        speaking.chatSpeaker = speaking.speakerType + '|' + speaking.id;

        return speaking;
    };
    const getAllGMs = () => {
        return findObjs({ type: 'player' }).filter(p => playerIsGM(p.id));
    };
    const getDefaultConfigObj = () => {
        return { bg: bgcolor, css: "", store: 'InsertArg', label: 'Loaded Ability' };
    };
    const splitArgs = a => a.split("#");
    const joinVals = a => [a.slice(0)[0], a.slice(1).join("#").trim()];
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const getMapArgFuncRegex = (obj) => {
        return new RegExp('^(' + Object.keys(obj).join("|") + '){{(.*(?=}}))}}');
        // group 1: function from function{{arguments}}
        // group 2: arguments from function{{arguments}}
    };
    const decodeUrlEncoding = (t) => {
        return t.replace(/%([0-9A-Fa-f]{1,2})/g, (f, n) => { return String.fromCharCode(parseInt(n, 16)); });
    };
    const execCharSet = ["&", "!", "@", "#", "%", "?"];
    const sheetElem = { attr: '&#64;', abil: '&#37;', macro: '&#35;' };

    const getAltColor = (primarycolor, fade = .35) => {

        let pc = hexToRGB(`#${primarycolor.replace(/#/g, '')}`);
        let sc = [0, 0, 0];

        for (let i = 0; i < 3; i++) {
            sc[i] = Math.floor(pc[i] + (fade * (255 - pc[i])));
        }

        return RGBToHex(sc[0], sc[1], sc[2]);
    };
    const RGBToHex = (r, g, b) => {
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);

        if (r.length === 1)
            r = "0" + r;
        if (g.length === 1)
            g = "0" + g;
        if (b.length === 1)
            b = "0" + b;

        return "#" + r + g + b;
    };
    const getTextColor = (h) => {
        h = `#${h.replace(/#/g, '')}`;
        let hc = hexToRGB(h);
        return (((hc[0] * 299) + (hc[1] * 587) + (hc[2] * 114)) / 1000 >= 128) ? "#000000" : "#ffffff";
    };
    const hexToRGB = (h) => {
        let r = 0, g = 0, b = 0;

        // 3 digits
        if (h.length === 4) {
            r = "0x" + h[1] + h[1];
            g = "0x" + h[2] + h[2];
            b = "0x" + h[3] + h[3];
            // 6 digits
        } else if (h.length === 7) {
            r = "0x" + h[1] + h[2];
            g = "0x" + h[3] + h[4];
            b = "0x" + h[5] + h[6];
        }
        return [+r, +g, +b];
    };
    const validateHexColor = (s, d = 'ff9747') => {
        let colorRegX = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i;
        return '#' + (colorRegX.test(s) ? s.replace('#', '') : d);
    };
    const htmlCoding = (s = "", encode = true) => {
        if (typeof s !== "string") return undefined;
        let searchfor = encode ? htmlTable : _.invert(htmlTable);
        s = s.replace(new RegExp(Object.keys(searchfor)
            .map((k) => { return escapeRegExp(k); })
            .join("|"), 'gmi'), (r) => { return searchfor[r]; })
            .replace(new RegExp(/\n/, 'gmi'), '<br><br>');
        return s;
    };
    const internalCallCoding = (s = "", encode = true) => {
        if (typeof s !== 'string') return undefined;
        let searchfor = encode ? intCallTable : _.invert(intCallTable);
        s = s.replace(new RegExp(Object.keys(searchfor)
            .map(k => escapeRegExp(k))
            .join("|"), 'gmi'), (r) => { return searchfor[r]; });
        return s;
    };
    const displayIAConfig = (theSpeaker, cfgObj = getDefaultConfigObj()) => {
        let clVersion = '(none)';
        let clMsg = '';
        try {
            clVersion = ialibcore.GetVrs();
        } catch (error) {
            clMsg = '<tr><td colspan = "2">It doesn\'t seem you have the IA Core Library of functions installed (a separate script).\
                You could have a third-party library installed which I can\'t detect,\
                but without some bank of functions, InsertArg may not work for you.</td></tr>';
        }
        let msg = `<table style="width:100%;">\
                        <tr>\
                            <td style="font-weight:bold;">InsertArg</td>\
                            <td style="text-align:right;font-weight:bold;">v&nbsp;${vrs}&nbsp;&nbsp;</td>\
                        </tr>\
                        <tr>\
                            <td style="font-weight:bold;">Core Library</td>\
                            <td style="text-align:right;font-weight:bold;">${clVersion === '(none)' ? '' : 'v&nbsp;'}${clVersion}&nbsp;&nbsp;</td>\
                        </tr>\
                        ${clMsg}\
                    </table><br>\
                    <table style="width:100%;">\
                        <tr>\
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;Logging is ${state.ia.logparser ? 'ON' : 'OFF'}</td>\
                            <td style="text-align:right;">${btnAPI({ bg: cfgObj.bg, label: 'TGL', api: `!ia --log`, css: cfgObj.css })}&nbsp;&nbsp;</td>\
                        </tr>\
                        <tr>\
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;Make Help Handout</td>\
                            <td style="text-align:right;">${btnAPI({ bg: cfgObj.bg, label: 'Make', api: `!ia --handout#make{{!!doc#help}}`, css: cfgObj.css })}&nbsp;&nbsp;</td>\
                        </tr>\
                        <tr>\
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;Make Global Config</td>\
                            <td style="text-align:right;">${btnAPI({ bg: cfgObj.bg, label: 'Make', api: `!ia --handout#make{{!!doc#config#global}}`, css: cfgObj.css })}&nbsp;&nbsp;</td>\
                        </tr>\
                        <tr>\
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;Make My Config</td>\
                            <td style="text-align:right;">${btnAPI({ bg: cfgObj.bg, label: 'Make', api: `!ia --handout#make{{!!doc#config#${theSpeaker.localName}}}`, css: cfgObj.css })}&nbsp;&nbsp;</td>\
                        </tr>\
                    </table><br><br>\
                    INTERNAL FUNCTIONS:<br>`;

        
        let rows = Object.keys(availFuncs).sort().map(f => {
            let btn = Object.prototype.hasOwnProperty.call(availHelp, f) ? btnAPI({ bg: cfgObj.bg, label: 'Help', api: `!ia --help#${f}`, css: cfgObj.css }) : "";
            return `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${f}</td><td style="text-align:right;">${btn}&nbsp;&nbsp;</td></tr>`;
        }).join("");
        msg += `<table style="width:100%;">${rows}</table><br>`;
        msgbox({ c: msg, t: 'INSERTARG CONFIG', send: true, wto: theSpeaker.localName });
    };

    const base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (e) {
            var t = "";
            var n, r, i, s, o, u, a;
            var f = 0;
            e = base64._utf8_encode(e);
            while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = (n & 3) << 4 | r >> 4;
                u = (r & 15) << 2 | i >> 6;
                a = i & 63;
                if (isNaN(r)) {
                    u = a = 64
                } else if (isNaN(i)) {
                    a = 64
                }
                t = t +
                    this._keyStr.charAt(s) +
                    this._keyStr.charAt(o) +
                    this._keyStr.charAt(u) +
                    this._keyStr.charAt(a)
            }
            return t
        },
        decode: function (e) {
            var t = "";
            var n, r, i;
            var s, o, u, a;
            var f = 0;
            e = e.replace(/[^A-Za-z0-9+/=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);
                if (u !== 64) {
                    t = t + String.fromCharCode(r)
                }
                if (a !== 64) {
                    t = t + String.fromCharCode(i)
                }
            }
            t = base64._utf8_decode(t);
            return t
        },
        _utf8_encode: function (e) {
            e = e.replace(/\r\n/g, "\n");
            var t = "";
            for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r)
                } else if (r > 127 && r < 2048) {
                    t +=
                        String.fromCharCode(r >> 6 | 192);
                    t +=
                        String.fromCharCode(r & 63 | 128)
                } else {
                    t +=
                        String.fromCharCode(r >> 12 | 224);
                    t +=
                        String.fromCharCode(r >> 6 & 63 | 128);
                    t +=
                        String.fromCharCode(r & 63 | 128)
                }
            }
            return t
        },
        _utf8_decode: function (e) {
            var t = "";
            var n = 0;
            var r = c1 = c2 = 0;
            while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++
                } else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode(
                        (r & 31) << 6 | c2 & 63);

                    n += 2
                } else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode(
                        (r & 15) << 12 | (c2 & 63)
                        << 6 | c3 & 63);
                    n += 3
                }
            }
            return t
        }
    };
    const btnElem = ({ bg: btnbg = bgcolor, store: s = "InsertArg", label: btnlabel = "Loaded Ability", charname: cn = "not set", entity: e = "&#37;", css: css = "" } = {}) => {
        if (e.length === 1) e = htmlTable[e] || e;
        btnbg = validateHexColor(btnbg);
        return `<a style="background-color: ${btnbg}; color: ${getTextColor(btnbg)}; ${css}" href="!&#13;${e}{${cn}|${s}}">${btnlabel}</a>`;
    };
    const btnAPI = ({ bg: btnbg = bgcolor, api: api = "", label: btnlabel = "Run API", css: css = "", r20style: r20style = false } = {}) => {
        btnbg = validateHexColor(btnbg);
        api = htmlCoding(api, true);
        r20style = ['t', 'true', 'y', 'yes', true].includes(r20style) ? true : false;
        return `<a style="background-color: ${btnbg}; color: ${getTextColor(btnbg)};${r20style ? 'padding: 5px;display:inline-block;border 1px solid white;' : ''}${css}" href="${api}">${btnlabel}</a>`;
    };
    const charFromAmbig = (info) => {                                       // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        character = findObjs({ type: 'character', id: info })[0] ||
            findObjs({ type: 'character' }).filter(c => c.get('name') === info)[0] ||
            findObjs({ type: 'character', id: (getObj("graphic", info) || { get: () => { return "" } }).get("represents") })[0];
        return character;
    };
    const playerFromAmbig = (info) => {                                       // find a player where info is an identifying piece of information (id or name)
        let player;
        player = findObjs({ type: 'player', id: info })[0] ||
            findObjs({ type: 'player' }).filter(p => p.get('displayname') === info)[0];
        return player;
    };
    const abilFromAmbig = (info, character = '') => {                                       // find an abil where info is an identifying piece of information for the ability (id or character|name)
        let abil = findObjs({ type: 'ability', id: info })[0];
        if (abil) return abil;
        let c, n;
        if (info.indexOf("|") > -1) {
            [c, n] = info.split("|");
        } else {
            c = character;
            n = info;
        }
        if (!c || !n) return abil;
        c = charFromAmbig(c);
        if (!c) return abil;
        abil = findObjs({ type: 'ability', characterid: c.id }).filter(a => a.get('name') === n)[0] ||
            findObjs({ type: 'ability', characterid: c.id }).filter(a => a.id === n)[0];
        return abil;
    };
    const attrFromAmbig = (info, character = '') => {                                       // find an attr where info is an identifying piece of information for the attribute (id or character|name)
        let attr = findObjs({ type: 'attribute', id: info })[0];
        if (attr) return attr;
        let c, n;
        if (info.indexOf("|") > -1) {
            [c, n] = info.split("|");
        } else {
            c = character;
            n = info;
        }
        if (!c || !n) return attr;
        c = charFromAmbig(c);
        if (!c) return attr;
        attr = findObjs({ type: 'attribute', characterid: c.id }).filter(a => a.get('name') === n)[0] ||
            findObjs({ type: 'attribute', characterid: c.id }).filter(a => a.id === n)[0];
        return attr;
    };
    const repeatingFromAmbig = (info, character = '', s = '', sfxn = '') => {
        let obj = findObjs({ type: 'attribute', id: info })[0];
        if (obj) return obj;
        let c, n;
        if (info.indexOf("|") > -1) {
            [c, n] = info.split("|");
        } else {
            c = character;
            n = info;
        }
        if (!c || !n) return obj;
        c = charFromAmbig(c);
        if (!c) return obj;
        obj = findObjs({ type: 'attribute', characterid: c.id }).filter(a => a.get('name') === n)[0] ||
            findObjs({ type: 'attribute', characterid: c.id }).filter(a => a.id === n)[0];
        if (obj) return obj;
        if (s && sfxn) {                                                // if we have a section and a naming suffix, test if what we have is the name of an element group from this section
            obj = findObjs({ type: 'attribute', characterid: c.id })
                .filter(a => new RegExp(`^repeating_${s}_.*?_${sfxn}$`).test(a.get('name')))
                .filter(a => a.get('current') === n)[0];
        }
        return obj;
    };
    const macroFromAmbig = (info) => {
        let mac = findObjs({ type: 'macro', id: info })[0];
        if (mac) return mac;
        mac = findObjs({ type: 'macro' }).filter(m => m.get('name') === info)[0];
        return mac;
    };
    const tokenFromAmbig = (info) => {
        let token = findObjs({ type: 'graphic', subtype: 'token', id: info })[0];
        if (token) return token;
        token = findObjs({ type: 'graphic', subtype: 'token' }).filter(t => t.get('name') === info)[0];
        return token;
        
    };
    const msgbox = ({ c: c = "chat message", t: t = "title", btn: b = "buttons", send: send = false, sendas: sas = "API", wto: wto = "" }) => {
        let tbl = msgtable.replace("__bg__", rowbg[0]);
        let hdr = msg1header.replace("__bg__", rowbg[1]).replace("__cell1__", t);
        let row = msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", c);
        let btn = b !== "buttons" ? msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", b).replace("__row-css__", "text-align:right;margin:4px 4px 8px;") : "";
        let msg = tbl.replace("__TABLE-ROWS__", hdr + row + btn);
        if (wto) msg = `/w "${wto}" ${msg}`;
        if (["t", "true", "y", "yes", true].includes(send)) {
            sendChat(sas, msg);
        } else {
            return msg;
        }
    };
    const getHelpArg = () => { return 'ArgOption'; };
    const applyFormatOptions = (f, l, prop = 'label') => {
        // expects f to be a pipe-separated list of formatting options in the form of fo[#(options)]
        // list is an array of objects in the form of {nameObj, execObj, label, execName, execText, rlbl}
        // prop is the property in the object to format
        let insertcheck;
        Object.keys(Object.fromEntries(f.split("|").map(fo => [fo, true]))).forEach(fo => {
            switch (fo) {
                case 'su':  // space before uppercase
                    l = l.map(a => Object.assign(a, { [prop]: a[prop].replace(/((?<!\b)[A-Z])/g, ' $1') }));
                    break;
                case '_s':  // replace underscore with space
                    l = l.map(a => Object.assign(a, { [prop]: a[prop].replace(/((?<!\b)_(?!\b))/g, ' ') }))
                        .map(a => Object.assign(a, { [prop]: a[prop].replace(/_/g, ' ') }));
                    break;
                case 'ss':  // remove extra white-space
                    l = l.map(a => Object.assign(a, { [prop]: a[prop].replace(/\s+/g, ' ') }));
                    break;
                case 'uc':  // to uppercase
                    l = l.map(a => Object.assign(a, { [prop]: a[prop].toUpperCase() }));
                    break;
                case 'lc':  // to lowercase
                    l = l.map(a => Object.assign(a, { [prop]: a[prop].toLowerCase() }));
                    break;
                case 'tc':  // to titlecase
                    l = l.map(a => Object.assign(a, { [prop]: a[prop].replace(/((?<=\b(?<![^\s]'))[a-z])/g, l => l.toUpperCase()) }));
                    break;
                case 'o+':  // sort ascending (order)
                    l = l.sort((a, b) => (a[prop] > b[prop]) ? 1 : -1);
                    break;
                case 'o-':  // sort descending (order)
                    l = l.sort((a, b) => (a[prop] > b[prop]) ? -1 : 1);
                    break;
                case 'n':
                    l = l.map(a => Object.assign(a, { [prop]: ia.RunInternal("nest")({ s: a[prop] }).ret }));
                    break;
                default:
                    // case fr
                    if (/fr#.+/.test(fo)) {		// find#replace
                        [, frmtsearch, frmtreplace = ''] = fo.split("#");
                        frmtsearch = checkTicks(frmtsearch);
                        frmtreplace = checkTicks(frmtreplace);
                        l = l.map(a => Object.assign(a, { [prop]: a[prop].replace(new RegExp(escapeRegExp(frmtsearch), 'g'), frmtreplace) }));
                    }

                    // case ^t or t^
                    insertcheck = /^(\^t|t\^)#(.+)/.exec(fo);
                    // group 1: type from type#insert
                    // group 2: insert from type#insert
                    if (insertcheck) {		    // insert around text
                        let ipre = insertcheck[1] === '^t' ? checkTicks(insertcheck[2]) : '';
                        let ipost = insertcheck[1] === 't^' ? checkTicks(insertcheck[2]) : '';

                        l = l.map(a => Object.assign(a, { [prop]: `${ipre}${a[prop]}${ipost}` }));
                    }

                    // case rslv
                    if (/^rslv#.+/.test(fo)) {  // resolve; like find/replace, except searches for the "find" as @{find}
                        [, frmtsearch, frmtreplace = ''] = fo.split("#");
                        frmtsearch = `@{${checkTicks(frmtsearch)}}`;
                        frmtreplace = checkTicks(frmtreplace);
                        l = l.map(a => Object.assign(a, { [prop]: a[prop].replace(new RegExp(escapeRegExp(frmtsearch), 'g'), frmtreplace) }));

                    }
                    break;
            }
        });
        return l;
    };
    const applyFilterOptions = (f, l, prop = 'execName', xprop = 'execText') => {
        // expects l to be an array of objects in the form of {nameObj, execObj, label, execName, execText, rlbl}
        if (f) {
            let topx;
            let filters = f.split("|").map(f => f.split("#")).map(f => { return { filter: f[0], cond: checkTicks(f.slice(1).join("#")) || "" }; });
            filters.forEach(f => {
                switch (f.filter) {
                    case 'x':       // only executable values
                        l = l.filter(a => typeof a[xprop] === 'string' && a[xprop].length && execCharSet.includes(a[xprop].charAt(0)));   // test for the presence of an executing character
                        break;
                    case '^f':      // starts with
                        l = l.filter(a => a[prop].startsWith(f.cond));
                        break;
                    case 'f^':      // ends with
                        l = l.filter(a => new RegExp(`${escapeRegExp(f.cond)}$`).test(a[prop]));
                        break;
                    case '^f^':     // contains
                        l = l.filter(a => new RegExp(`${escapeRegExp(f.cond)}`).test(a[prop]));
                        break;
                    case '-^f':     // does not start with
                        l = l.filter(a => !a[prop].startsWith(f.cond));
                        break;
                    case '-f^':     // does not end with
                        l = l.filter(a => !(new RegExp(`${escapeRegExp(f.cond)}$`).test(a[prop])));
                        break;
                    case '-^f^':    // does not contain
                        l = l.filter(a => !(new RegExp(`${escapeRegExp(f.cond)}`).test(a[prop])));
                        break;
                    case '-s':      // token status markers do not include
                        l = l.filter(a => !a.nameObj.get('statusmarkers').split(",").includes(f.cond));
                        break;
                    case 's':      // token status markers include
                        l = l.filter(a => a.nameObj.get('statusmarkers').split(",").includes(f.cond));
                        break;
                    case 'top':
                        topx = parseInt(f.cond);
                        if (isNaN(topx) || topx === 0) break;
                        l = topx > 0 ? l.slice(0, topx) : l.slice(topx);
                        break;
                    default:
                        break;
                }
            });
        }
        return l;
    };
    const buildOutputOptions = ({ p: p, op: op, list: list, bg: bg, css: css, character: character = { get: () => { return '' } }, elem: elem = 'attr', v: v = 'current', theSpeaker: theSpeaker, d: d }) => {
        let retObj = { ret: "", safe: true };
        v = elem === 'abil' ? 'action' : v;
        let q2 = "", prop = 'l', mArg = 'whisper';
        let msg = '';
        switch (op.charAt(0)) {
            case "b":   // buttons
                if (op.length > 1) q2 = op.slice(1);
                switch (q2) {
                    case 'c':   // card output button, set to whisper
                    case 'C':   // card outputbutton, set to chat
                        if (q2 === 'C') mArg = 'chat';
                        if (!Object.prototype.hasOwnProperty.call(list[0], "cardapi")) {
                            ia.MsgBox({ c: `buildOutputOptions: Card output is currently only intended for repeating sections.`, t: 'NOT A REPEATING SOURCE', send: true, wto: theSpeaker.localName });
                            return retObj;
                        }
                        retObj.ret = list.map(a => {
                            return ia.BtnAPI({ bg: bg, api: ia.InternalCallCoding(`!ia --${mArg} --show#${a.cardapi || ''}`, true), label: a.label, charid: character.id, entity: sheetElem[elem], css: css })
                        }).join(d);
                        break;
                    case 'ec':  // card output for external labels (elem output)
                    case 'ce':
                    case 'eC':
                    case 'Ce':
                        if (['Ce','eC'].includes(q2)) mArg = 'chat';
                        if (!Object.prototype.hasOwnProperty.call(list[0], "cardapi")) {
                            ia.MsgBox({ c: `buildOutputOptions: Card output is currently only intended for repeating sections.`, t: 'NOT A REPEATING SOURCE', send: true, wto: theSpeaker.localName });
                            return retObj;
                        }
                        retObj.ret = list.map(a => {
                            return a.label + ia.ElemSplitter.inner + ia.BtnAPI({ bg: bg, api: ia.InternalCallCoding(`!ia --${mArg} --show#${a.cardapi || ''}`, true), label: a.rlbl, charid: character.id, entity: sheetElem[elem], css: css })
                        }).join(ia.ElemSplitter.outer);

                        break;
                    case 'R':   // read the action text in a msgbox
                    case 'r':
                        if (q2 === 'R') mArg = 'chat';
                        retObj.ret = list.map(a => ia.BtnAPI({ bg: bg, api: ia.InternalCallCoding(`!ia --${mArg} --show#msgbox{{!!c#get${elem}{{!!a#${a.execObj.id} !!h#true !!v#${v}}} !!t#${a.label} !!send#true !!sendas#getme{{!!r#cs}}}}`,true), label: a.label, charid: character.id, entity: sheetElem[elem], css: css }))
                            .join(d);
                        break;
                    case 'e':   // spread the return out over multiple table elements
                        retObj.ret = list.map(a => { return a.label + ia.ElemSplitter.inner + ia.BtnElem({ bg: bg, store: a.execName, label: a.rlbl, charname: character.get('name'), entity: sheetElem.attr, css: css }) })
                            .join(ia.ElemSplitter.outer);
                        break;
                    case 'er':  // both 'e' and 'r', reading the action text in a msgbox and spreading the return over multiple table elements
                    case 're':
                    case 'eR':  // same, but chat output (not whisper)
                    case 'Re':
                        if (['Re', 'eR'].includes(q2)) mArg = 'chat';
                        retObj.ret = list.map(a => { return a.label + ia.ElemSplitter.inner + ia.BtnAPI({ bg: bg, api: ia.InternalCallCoding(`!ia --${mArg} --show#msgbox{{!!c#get${elem}{{!!a#${a.execObj.id} !!h#true !!v#${v}}} !!t#${a.label} !!send#true !!sendas#getme{{!!r#cs}}}}`,true), label: a.rlbl, charid: character.id, entity: sheetElem[elem], css: css }) })
                            .join(ia.ElemSplitter.outer);
                        break;
                    case "":
                    default:
                        retObj.ret = list.map(a => ia.BtnElem({ bg: bg, store: a.execName, label: a.label, charname: character.get('name'), entity: sheetElem[elem], css: css }))
                            .join(d);
                        break;
                }
                break;
            case "c":   // card output (whisper or chat determined by mapArg)
                list.map(l => {
                    if (!Object.prototype.hasOwnProperty.call(l, "sublist")) {
                        Object.assign(l, { sublist: [['', 'Name', l.label], ['', 'Description', l.execText]] });       // if we don't have the sublist, build it just with the stuff we do have
                    }
                    msg = l.sublist.map((a, i) => `<tr><${i === 0 ? 'th' : 'td'} style="vertical-align:top;">${htmlCoding(a[1]).replace(/\s/g,'&nbsp;')}</td><td>&nbsp;</td><${i === 0 ? 'th' : 'td'} style="vertical-align:top;">${typeof a[2] !== 'string' ? a[2] : htmlCoding(a[2])}</td></tr>`).join("");
                    msg = `<table style="width:96%;">${msg}</table>`;
                    retObj.ret += msgbox({ c: msg, t: 'CARD', send: false }) + '<br>';
                });
                break;
            case "q":   // query
            case "n":   // nested query
                if (op.length > 1) q2 = op.slice(1);
                switch (q2) {
                    case 'l':       // list of labels
                        list = list.map(a => a.label.replace(/,/g, '')).join("|");
                        break;
                    case 'v':       // list of values
                        list = list.map(a => a.execText).join("|");
                        break;
                    case 'ln':      // label, value (or character name)
                        list = list.map(a => [a.label.replace(/,/g, ''), a.execName]);
                        prop = 'a';                                                     // change the property to which we will feed the list to be 'a' since we have built an array
                        break;
                    case 'lv':      // label, value
                    default:
                        list = list.map(a => [a.label.replace(/,/g, ''), a.execText]);
                        prop = 'a';                                                     // change the property to which we will feed the list to be 'a' since we have built an array
                }
                retObj = ia.RunInternal("query")({ p: p, [prop]: list, n: (op.charAt(0) === "n") ? 'true' : 'false', theSpeaker: theSpeaker });
                break;
            case "v":   // produce list of the values
                list = list.map(a => a.execText).join(d);
                retObj.ret = list;
                break;
            case "l":   // produce list of the labels
                if (op.length > 1) q2 = op.slice(1);
                switch (q2) {
                    case 've':
                        list = list.map(a => { return a.label + ia.ElemSplitter.inner + a.execText; }).join(ia.ElemSplitter.outer);
                        retObj.ret = list;
                        break;
                    default:
                        list = list.map(a => a.label).join(d);
                        retObj.ret = list;
                        break;
                }
                break;
            default:
                list = list.map(a => a.label).join(d);
                retObj.ret = list;
                break;
        }
        return retObj;
    }
    const checkTicks = (s) => {
        let special = {
            "`br`": "<br>",
            "`hr`": "<hr>"
        }

        if (typeof s !== 'string') return s;
        return special[s] || (s.indexOf("`") === 0 && s.charAt(s.length - 1) === "`" ? s.slice(1, s.length - 1) : s);

    };


    // ==================================================
    //		AVAIL INTERNAL FUNCTIONS, HELP, and MENUS
    // ==================================================
    //      each function should be built using destructuring assignment, which will provide immediate !!arg availability to each parameter
    //      each function should return an object of { ret:the text constructed, safe: whether it's safe to chat }
    //      once built, enter it in the library object availFuncs to make it available to users (below functions)

    const nest = ({
        s: s = "",                                                  // string to perform the replace on
    }) => {
        let retObj = { ret: "", safe: true };
        let nestrx = new RegExp(/[@%]{[^}]*?}|([,|}])/, 'gm');
        // group 1s: all } , | that are not part of an ability or attribute
        if (s) {
            retObj.ret = s.replace(nestrx, (match) => { return htmlTable[match]; });
        }
        return retObj;
    };
    const query = ({
        p: p = "Select",                                                // prompt for query
        l: l = "",                                                      // pre-built list of options
        a: a,                                                           // array a [label, return]
        n: n = "false",                                                 // whether to make this a nested query
        m: m,                                                           // message object
        theSpeaker: theSpeaker,                                         // the Speaker object
        cfgObj: cfgObj,                                                 // config object
    }) => {
        let retObj = { ret: "", safe: true };
        n = ["true", "t", "yes", "y"].includes(n.toLowerCase());
        let list = "";
        if (l) {                                                        // user supplied a list, so use it
            list = l;
        } else if (Array.isArray(a) && a.length) {                      // user supplied an array of [label, return], so build from there
            list = a.map(e => e.join(",")).join("|");
        } else {
            ia.MsgBox({ c: `query: You must supply either a list (l) or an array (a) of elements in the form of [label, return].`, t: 'NO QUERY SOURCE', send: true, wto: theSpeaker.localName });
            return retObj;
        }
        retObj.ret = n ? nest({ s: `?{${p}|${list}}` }).ret : `?{${p}|${list}}`;
        return retObj;
    };
    const getrow = ({
        r: r = "row",                                                   // menu element to retrieve; menu entry must have that element available
        c: color = '',                                                  // color override for the row
        f: f,                                                           // fade override
        t: t = 'Section',                                               // row heading
        s: s = '',                                                      // source for the row content
        theSpeaker: theSpeaker
    }) => {
        let retObj = { ret: "", safe: true };
        state.ia[theSpeaker.localName] = state.ia[theSpeaker.localName] || {};
        state.ia[theSpeaker.localName].menu = state.ia[theSpeaker.localName].menu ||                                       // menu in the state variable is there, or...
            Object.assign({ tbl: "", row: "", elem: "", menu: "default", color: "#4b688b", fade: .5 }, availMenus.default || { row: "", menu: "" });   // get defaults, defaulting to empty string if the default menu isn't present
        let ms = Object.assign({}, state.ia[theSpeaker.localName].menu);

        let maintextcolor = getTextColor(ms.color);
        r = ['e', 'elem'].includes(r) ? 'elem' : 'row';
        if (!Object.prototype.hasOwnProperty.call(ms, r)) r = "row";                    // if the menu doesn't offer that menu element, default to row

        // get the color (check for override)
        if (color) color = validateHexColor(color, '#ffffff');                          // if user supplied a color override, validate it using white as a default
        else color = validateHexColor(ms.color);

        let mcno = validateHexColor(ms.color);                                          // set color for maincolor_nooverride
        // get the fade
        if (f) f = (isNaN(Number(f)) || Number(f) > 1 || Number(f) < 0) ? .5 : Number(f);                                   // if provided and it's not a number, or it's a number outside of the 0-1 range, make it .5
        else f = (isNaN(Number(ms.fade)) || Number(ms.fade) > 1 || Number(ms.fade) < 0) ? .5 : Number(ms.fade);             // if not provided, put the same tests to the menu in state

        // fade the color for altcolor
        altcolor = getAltColor(color, f);
        // get text color
        let alttextcolor = getTextColor(altcolor);

        // there is still the possibility that the specified menu does not have an "r" element,
        // so we have to account for creating a default, if necessary
        switch (r) {
            case 'elem':
                if (new RegExp(`${escapeRegExp(elemSplitter.outer)}$`).test(s)) {
                    s = base64.decode(s.slice(0, elemSplitter.outer.length * -1));
                }
//                s.split(elemSplitter.outer).map(e => e.split(elemSplitter.inner)).forEach(fe => { log(`LABEL: ${fe[0]}`); log(`BUTTON: ${fe[1]}`); });
                retObj.ret = s.split(elemSplitter.outer).map(e => e.split(elemSplitter.inner))
                    .map(e => {
                        return (availMenus[ms.menu][r] || availMenus.default.row || "") // get the row (or default)
                            .replace(/\bmaincolor_nooverride\b/g, mcno)                 // replace maincolor_nooverride references
                            .replace(/\bmaincolor\b/g, color)                           // replace maincolor references
                            .replace(/\bmaintextcolor\b/g, maintextcolor)               // replace maintextcolor references
                            .replace(/\baltcolor\b/g, altcolor)                         // replace rowbgcolor references
                            .replace(/\balttextcolor\b/g, alttextcolor)                 // replace rowtextcolor references
                            .replace(/\btitle\b/, e[0])                                 // replace the title
                            .replace(/\browsource\b/, e[1])                             // finally, insert the source into the row
                    })
                    .join("");
                break;
            case 'row':
            default:
                retObj.ret = (availMenus[ms.menu][r] || availMenus.default.row)         // get the row (or default)
                    .replace(/\bmaincolor_nooverride\b/g, mcno)                         // replace maincolor_nooverride references
                    .replace(/\bmaincolor\b/g, color)                                   // replace maincolor references
                    .replace(/\bmaintextcolor\b/g, maintextcolor)                       // replace maintextcolor references
                    .replace(/\baltcolor\b/g, altcolor)                                 // replace rowbgcolor references
                    .replace(/\balttextcolor\b/g, alttextcolor)                         // replace rowtextcolor references
                    .replace(/\btitle\b/, checkTicks(t))                                // replace the title
                    .replace(/\browsource\b/, checkTicks(s));                           // finally, insert the source into the row

                break;

        }
        return retObj;
    };
    const msgboxwrapper = ({ c: c = "chat message", t: t = "title", btn: btn = "buttons", theSpeaker: theSpeaker }) => {
        return { ret: msgbox({ c: c, t: t, btn: btn, send: false, sendas: theSpeaker.chatSpeaker }), safe: true };
    };
    // ----------- AVAILABLE LIBRARIES -----------
    const availFuncs = {                                                // library of available functions as prop:func
        query: query,
        nest: nest,
        getrow: getrow,
        msgbox: msgboxwrapper
    };
    const availHelp = {
        query: {
            msg: 'Turns a list of options (l) into a query using prompt argument (p). Alternatively, produces a nested query by including the argument "n". \
                    For internal calls, supports an array object passed to "a" instead of a list.',
            args: [
                ['p', 'prompt for query (or nested query) output; default: Select'],
                ['l', 'list of options to use as query rows; can be pipe-separated labels, or a series of pipe-seperated (label),(value) options'],
                ['n', 'whether to nest the query, replacing the three characters: } , | with their html entities only where they are not involved in an attribute or ability lookup'],
            ]
        },
        nest: {
            msg: 'Renders existing text (s) so that it does not break a bounding query; replaces three characters ( } , | ) where they are not involved in an attribute or ability lookup.',
            args: [
                ['s', 'the string on which to perform the replacement operation']
            ]
        },
        getrow: {
            msg: 'Retrieves a row from the designated menu (or default menu if none was specified in the first argument).',
            args: [
                ['r', 'menu element to retrieve; menu entry must have that element available; default: row\
                        default menu includes options for "row" and "elem", though other menus might provide more'],
                ['c', 'color override for the row; obviates fade arg (f) for this row'],
                ['f', 'a number between 0 and 1 representing how much to fade the overall theme color designated for the menu; \
                        default: (none), but input that does not interpret to a value between 0 and 1 will be treated as .5'],
                ['t', 'title text for the row'],
                ['s', 'source text for the row contents']
            ]
        },
        msgbox: {
            msg: 'Outputs a message box to chat (like what you are reading, now) with a title (t), message (c), and button elements (btn), if desired.',
            args: [
                ['c', 'chat contents; in other words, the message portion of the message box'],
                ['t', 'title for the message box'],
                ['btn', 'secondary text area; putting buttons here will keep them visually separated from your message text']
            ]
        }
    };                                               // library of available help text as an object of { msg: string, args: [ [prop, explanation], [prop, explanation]] }
    const availMenus = {                                                // library of available menus
        default: { tbl: menutable, row: menurow, color: '#4b688b', fade: .5, elem: menuelem }
    };

    const runInternal = (f, lib = "availFuncs") => {
        let libObj = {
            availFuncs: availFuncs
        };

        return libObj[lib][f];
    };
    const registerRule = (...r) => {                                                        // pass in a list of functions to get them registered to the availFuncs library
        r.forEach(f => {
            if (f.name) {
                if (availFuncs[f.name]) {
                    log(`IA Function Registration: Name collision detected for ${f.name}. Last one loaded will win.`);
                    delete availHelp[f.name];
                }
                availFuncs[f.name] = f;
            }
        });
    };
    const registerMenu = (m) => {                                                         // pass in a schema object
        if (availMenus[m.name]) log(`IA Menu Registration: Name collision detected for ${m.name}. Last one loaded will win.`);
        availMenus[m.name] = m;
    };
    const registerHelp = (h) => {
        Object.keys(h).forEach(f => {
            if (availHelp[h[f]]) log(`IA Help Registration: Name collision detected for ${f}. Last one loaded will win.`);
            availHelp[f] = h[f];
        });
    };

    // ==================================================
    //		FIRST ARGUMENT FUNCTIONS (MAPARG)
    // ==================================================
    //      these functions are for special values provided to the first argument
    //      each function should be built using destructuring assignment, which will provide immediate !!arg availability to each parameter
    //      each function should return an object in the form of { ret: compiled text, safe: true/false, suspend: true/false }
    //      once built, enter it in the library object mapArgFuncs to make it available to users

    const processHandout = ({ args: args, m: m, theSpeaker: theSpeaker, cfgObj: cfgObj }) => {
        let retObj = { ret: "", safe: true, suspend: true };

        // available functions to the handout process
        const rename = ({                                       // !ia --handout#rename{{...}}
            oldn: oldn,                                         // old handout name, if provided
            oldid: oldid,                                       // old handout id, if provided
            nn: nn = "",                                        // new handout name
            cfgObj: cfgObj,                                     // config settings
            } = {}) => {
            let api = `http://journal.roll20.net/handout/`;
            if (!nn) {                                          // no new name provided
                msgbox({ c: "Unable to rename: no new name provided.", t: "ERROR", send: true });
            } else {
                let ho,
                    btn = "",
                    msg = "";
                if (findObjs({ type: 'handout', name: nn }).length > 0) {   // handout with new name already exists
                    msg = "Handout already exists with the new name.";
                } else if (oldn) {                              // user provided old handout name
                    ho = findObjs({ type: 'handout', name: oldn });
                    if (ho.length < 1) {
                        msg = "No handout found with that name.";
                    } else if (ho.length > 1) {
                        msg = "Multiple handouts have that name. You're going to have to figure this out on your own.";
                        btn = ho.reduce((a, v, i) => { return a + btnAPI({ bg: cfgObj.bg, api: api + v.id, label: `(${i + 1}) ${v.get('name').replace(/iaconfig-/i, "")}`, css: cfgObj.css, r20style: true }) + ' ' }, "");
                    }
                } else if (oldid) {                             // user provided old handout id
                    ho = findObjs({ type: 'handout', id: oldid });
                    if (ho.length < 1) {
                        msg = "No handout found with that id.";
                    }
                }
                if (msg) {                                      // if there is a message (an error), output it and exit
                    msgbox({ c: msg, t: "ERROR", send: true, btn: btn, wto: theSpeaker.localName });
                    return retObj;
                }
                ho[0].set({ name: nn });                        // if we get this far, it's safe to rename the handout
                handleConfig(ho[0], { name: oldn });            // the rename won't trigger the event, so we have to call this manually
                msgbox({ c: "Config file renamed successfully. Config contents are written asynchronously to state, so this button may still appear under the previous/default configuration.", t: "CONFIG RENAMED", btn: btnAPI({ bg: cfgObj.bg, css: cfgObj.css, api: api + ho[0].id, label: 'Open', r20style: true }), send: true, wto: theSpeaker.localName });
            }
            return retObj;
        };
        const make = ({                                         // !ia --handout#make{{!!doc#...}}
            theSpeaker: theSpeaker,
            cfgObj: cfgObj,
            doc: doc = "",
            
        } = {}) => {
            if (!doc) return retObj;
            let docarg;
            let apicmd;
            let api;
            [doc, docarg = ''] = doc.split("#");                // doc will have "help", or "config", etc.; docarg will have the next segment -- currently only 2 #-separated segments allowed; docarg will be split by pipes, if necessary
            docarg = docarg.split("|");
            if (doc === "help") {                               // !ia --handout#make{{!!doc#help#(overwrite)}}
                let helpho = findObjs({ type: "handout", name: `IA Help` })[0];
                if ((!docarg.length || !['t', 'true'].includes(docarg[0])) && helpho) {          // help handout already exists, and the overwrite command was not provided
                    apicmd = '!ia --handout#make{{!!doc#help#true}}';
                    msgbox({ c: "Help handout already exists (IA Help). Overwrite?", t: "HELP EXISTS", btn: btnAPI({ bg: cfgObj.bg, css: cfgObj.css, api: apicmd, label: 'Yes' }), send: true, wto: theSpeaker.localName });
                    return retObj;
                }
                let helptemplate = `<h2>__helpheader__</h2<h4>type: __type__</h4><br><h3>Usage</h3>__msg__<h3>__argheader__</h3><table style="width: 100%;">__argrows__</table><br>`;
                let helpentries = Object.keys(availHelp).sort((a, b) => a > b ? 1 : -1)
                    .map(a => {
                        return {
                            origname: a,
                            dispname: availFuncs[a] ? a : a.replace(getHelpArg(), ''),
                            type: availFuncs[a] ? 'function' : a.indexOf(getHelpArg()) > -1 ? 'arg options' : 'unknown',
                            msg: availHelp[a].msg,
                            argtype: availFuncs[a] ? 'ARGUMENTS' : a.indexOf(getHelpArg()) > -1 ? 'OPTIONS' : 'unknown',
                            args: availHelp[a].args.map(o => {
                                let h = /gethelp\(([^)]+)\)/g.exec(o[1]);
                                if (h) return `<tr><td style="width:30px;">${o[0]}</td><td><span style="font-style:italic;">see help entry for <span style="font-style:italic;">${h[1].replace(getHelpArg(),'')}</span></td>`;
                                return `<tr><td style="width:30px;">${o[0]}</td><td>${o[1]}</td>`;
                            })
                            .join("")
                        
                        };
                    });
                let helpoutput = helpentries.map(h => helptemplate.replace('__helpheader__', h.dispname).replace('__type__', h.type).replace('__msg__', h.msg).replace('__argheader__', h.argtype).replace('__argrows__', h.args));
                if (!helpho) helpho = createObj('handout', { name: 'IA Help', inplayerjournals: 'all', archived: false });
                helpho.set({ notes: helpoutput });
                api = `http://journal.roll20.net/handout/${helpho.id}`;
                btn = btnAPI({ bg: cfgObj.bg, api: api, label: `Open`, css: cfgObj.css, r20style: true });
                
                msgbox({ c: "Help handout named 'IA Help' created.", t: "HANDOUT CREATED", btn: btn, send: true, wto: theSpeaker.localName });
                return retObj;

            } else {                                            // !ia --handout#make{{!!doc#config#player|character|...}}
                if (doc === 'config') {
                    if (!docarg.length) {
                        msgbox({ c: "No config document specified.", t: "INVALID STRUCTURE", send: true, wto: theSpeaker.localName });
                        return retObj;
                    }
                    let hoObj, defcfg, corp, cby, btn = [];
                    docarg.forEach(c => {
                        if (c !== 'global') {
                            if (charFromAmbig(c)) {
                                corp = charFromAmbig(c);
                                cby = corp.get('controlledby');
                                corp = corp.get('name');
                            }
                            else if (playerFromAmbig(c)) {
                                corp = playerFromAmbig(c);
                                cby = corp.id;
                                corp = corp.get('displayname');
                            }
                            else {
                                corp = c;
                                cby = '';
                            }
                        } else {
                            corp = 'global';
                            cby = getAllGMs().map(g => g.id).join(",");
                        }
                        if (corp === 'global' && !playerIsGM(theSpeaker.playerid)) {
                            msgbox({ c: "You must be a GM to create the global config.", t: "GM RIGHTS REQUIRED", send: true, wto: theSpeaker.localName });
                        } else {
                            hoObj = findObjs({ type: "handout", name: `IAConfig-${corp}` })[0] || { fail: true };
                            if (Object.prototype.hasOwnProperty.call(hoObj, "fail")) {     // only write the handout if one doesn't exist
                                defcfg = `<pre>${htmlCoding('<!-- BEGIN CONFIG -->')}\n`;
                                defcfg += htmlCoding(`--bg#${bgcolor}`) + `\n`;
                                defcfg += htmlCoding(`--css#padding:4px;`) + `\n`;
                                defcfg += `${htmlCoding('<!-- END CONFIG -->')}</pre>`;
                                hoObj = createObj("handout", { name: `IAConfig-${corp}`, inplayerjournals: 'all', controlledby: cby });
                                hoObj.set('notes', defcfg);
                                api = `http://journal.roll20.net/handout/${hoObj.id}`;
                                btn.push(btnAPI({ bg: cfgObj.bg, api: api, label: corp, css: cfgObj.css, r20style: true }));
                                handleConfig(hoObj, { name: hoObj.get('name') });                           // get it into state
                            }
                        }
                    });
                    if (btn.length) {
                        msgbox({ c: "The following config files were created. Click any to open.", t: "HANDOUT CREATED", btn: btn.join(' '), send: true, wto: theSpeaker.localName });
                    }
                }
            }
            return retObj;
        };

        // available function library, mapping the text supplied to the internal function
        const funcTable = {
            rename: rename,
            make: make,
        };

        let funcregex = getMapArgFuncRegex(funcTable);
            // group 1: function from function{{arguments}}
            // group 2: arguments from function{{arguments}}
        let f = funcregex.exec(args);
        if (f) {
            retObj = funcTable[f[1]]({
                ...(Object.fromEntries((f[2] || "").split("!!")                     // this turns anything provided with a !! prefix into an available parameter for the receiving function
                    .filter((p) => { return p !== ""; })
                    .map(splitArgs)
                    .map(joinVals))),
                theSpeaker: theSpeaker,
                m: m,
                cfgObj: cfgObj,
            });
        } else {
            msgbox({ c: 'Unrecognized or poorly formatted mapArg command.', t: "ERROR", send: true, wto: theSpeaker.localName });
        }
        return retObj;
    };
    const runHelp = ({ args: f, m: m, theSpeaker: theSpeaker, cfgObj: cfgObj }) => {
        let retObj = { ret: "", safe: true, suspend: true };

        let { msg: msg = "No help specified", args: fargs = [["n/a", "No arguments specified"]] } = availHelp[f] || {};       // destructuring assignment of the help object, if present (empty object if not)
        let rows = fargs.map(a => `<tr><td style="vertical-align:top;">&nbsp;&nbsp;&nbsp;&nbsp;${a[0]}</td><td>&nbsp;&nbsp;</td><td>${a[1]}</td></tr>`).join("");

        rows = rows.replace(/gethelp\(([^)]+)\)/g, ((m,g) => btnAPI({ bg: cfgObj.bg, label: 'Help', api: `!ia --help#${g}`, css: cfgObj.css })));        

        let tbl = `<table style="width:100%;">${rows}</table>`;
        let subhdr;
        if (availFuncs[f]) {                                            // if we detect f as a function
            subhdr = 'ARGUMENTS';
        } else {                                                        // if it's not a function, treat it as options for an argument
            subhdr = 'OPTIONS';
            f = f.replace(getHelpArg(), '').toUpperCase();
        }

        msg += `<br><br>${subhdr}:<br>${tbl}`;
        msgbox({ c: msg, t: `HELP: ${f}`, send: true, wto: theSpeaker.localName });
        return retObj;
    };
    const processmenu = ({ args: args, m: m, theSpeaker: theSpeaker, cfgObj: cfgObj }) => {
        let retObj = ({ ret: "", safe: true, suspend: true });          // suspend first set to true until we know we have a menu
        let [menu, color, fade] = args.split("|");                      // we're not guaranteed to get all three arguments, so the rest of the code will have to build in defaults if we don't

        menu = menu || 'default';
        if (!Object.prototype.hasOwnProperty.call(availMenus, menu)) {
            if (Object.prototype.hasOwnProperty.call(availMenus, 'default')) {
                menu = 'default';
                msgbox({ c: `menu: Couldn't find a menu named ${menu}, using default menu instead.`, t: 'USING DEFAULT MENU', send: true, wto: theSpeaker.localName });

            } else {
                msgbox({ c: `menu: Couldn't find a menu named ${menu}; no default menu available.`, t: 'NO DEFAULT MENU', send: true, wto: theSpeaker.localName });
                return retObj;
            }
        }
        color = validateHexColor(color || '', '4b688b');
        fade = (isNaN(Number(fade)) || Number(fade) > 1 || Number(fade) < 0) ? .5 : Number(fade);   // if it's not a number, or it's a number outside of the 0-1 range, make it .5
        // we should not have valid (if defaulted) menu, color, and fade
        state.ia[theSpeaker.localName] = state.ia[theSpeaker.localName] || {};
        state.ia[theSpeaker.localName].menu = state.ia[theSpeaker.localName].menu || {};
        Object.assign(state.ia[theSpeaker.localName].menu, availMenus[menu]);
        Object.assign(state.ia[theSpeaker.localName].menu, { menu, color, fade });
        let textcolor = getTextColor(color);
        let altcolor = getAltColor(color);
        let alttextcolor = getTextColor(altcolor);
        retObj.ret = availMenus[menu].tbl                               // return the table structure
            .replace(/\bmaincolor\b/g, color)
            .replace(/\bmaintextcolor\b/g, textcolor)                              
            .replace(/\baltcolor\b/g, altcolor)
            .replace(/\balttextcolor\b/g, alttextcolor);
        retObj.suspend = false;                                         // let the process continue
        return retObj;
    };
    const processLog = ({ args: args, m: m, theSpeaker: theSpeaker, cfgObj: cfgObj }) => {
        let retObj = { ret: "", safe: true, suspend: true };
        state.ia = state.ia || {};
        state.ia.logparser = state.ia.logparser || false;
        state.ia.logparser = state.ia.logparser ? false : true;
        log(`INSERTARG: Event logging ${state.ia.logparser ? 'initiated' : 'terminated'} by ${theSpeaker.localName}`);
        msgbox({ c: `Logging has been turned ${state.ia.logparser ? 'ON. Go to your console in your browser or in your script library to see the logged events of a call to InsertArg.' : 'OFF.'}`, t: `LOGGING`, send: true, wto: theSpeaker.localName });
        return retObj;
    }
    // ------------- FIRST ARG FUNCTION LIBRARY --------------
    const mapArgFuncs = {
        handout: processHandout,
        help: runHelp,
        menu: processmenu,
        log: processLog
    };

    // ==================================================
    //		HANDLE CONFIG
    // ==================================================
    const horx = /^iaconfig-(.+)$/i;                                      //group 1: forName from iaconfig-forName
    const handleCharNameChange = (character, prev) => {
        // this listens for a character name change, and checks whether there is a configuration file that needs to be managed

        let oldrx = new RegExp(`\\s*(iaconfig-)(${escapeRegExp(prev.name).replace(/\s/g, `\\s`)})$`);
        // group 1: iaconfig- from iaconfig-prevname
        // group 2: prevName from iaconfig-prevname

        let newrx = new RegExp(`\\s*(iaconfig-)(${escapeRegExp(character.get('name')).replace(/\s/g, `\\s`)})$`);
        // group 1: iaconfig- from iaconfig-characterame
        // group 2: charactername from iaconfig-charactername

        let oldhos = findObjs({ type: "handout" }).filter(h => oldrx.test(h.get('name')));
        if (oldhos.length === 0) return;                              // no config handouts found
        oldhos.forEach(h => log(h.get('name')));

        state.ia[character.get('name')] = state.ia[character.get('name')] || {};
        state.ia[character.get('name')].cfgObj = state.ia[character.get('name')].cfgObj || {};
        Object.assign(state.ia[character.get('name')], state.ia[prev.name] || { cfgObj: Object.assign({}, state.ia.global.cfgObj) });
        let cfgObj = {};
        Object.assign(cfgObj, state.ia[character.get('name')].cfgObj);
        let msg = "",
            btn = "",
            api = "",
            newhos = findObjs({ type: "handout" }).filter(h => newrx.test(h.get('name')));
        if (newhos.length + oldhos.length > 1) {               // detect conflicts
            msg = `That character has multiple script configurations, either under ${character.get('name')} or under ${prev.name}. You should only keep one, and it should be named IAConfig-${character.get('name')}. Open handouts for comparison?<br>`;
            api = `http://journal.roll20.net/handout/`;
            btn = oldhos.reduce((a, v, i) => { return a + btnAPI({ bg: cfgObj.bg, api: api + v.id, label: `(${i + 1})&nbsp;${v.get('name').replace(/iaconfig-/i, "").replace(/\s/g, '&nbsp;')}`, css: cfgObj.css, r20style: true }) + ' ' }, "");
            btn = newhos.reduce((a, v, i) => { return a + btnAPI({ bg: cfgObj.bg, api: api + v.id, label: `(${i + 1})&nbsp;${v.get('name').replace(/iaconfig-/i, "").replace(/\s/g, '&nbsp;')}`, css: cfgObj.css, r20style: true }) + ' ' }, btn);

        } else {                                                // only get here if there is a config for the old name but not the new (ie, no collision)
            let o = oldrx.exec(oldhos[0].get('name'));
            msg = `${character.get('name')} had an InsertArgs script configuration as ${prev.name}. Do you want to rename the config to match the new name?<br>`;
            api = `!ia --handout#rename{{!!oldid#${oldhos[0].id} !!nn#${o[1] + character.get('name')}}}`;
            btn = btnAPI({ bg: cfgObj.bg, api: api, label: "Rename", css: "min-width: 25px;" + cfgObj.css });
        }
        msgbox({ c: msg, t: "MANAGE CONFIG FILE", btn: btn, send: true, wto: character.get('name') });
    }
    const handleConfig = (cfgho, prev) => {
        // listens for handout changes, detects config handouts, and copies those into the state variable for the appropriate speaker
        // calls cfgIntoState, which calls parseConfig
        // 4 cases to manage: config file named to non-config, non-config named to config, config named to another config, or changes to notes
        let honame = cfgho.get('name');
        if (!(horx.test(honame) || horx.test(prev.name) )) return;                          // if this wasn't a config template at some point in the change, we don't care
        let honamepart;
        if (honame !== prev.name) {                                                         // name was changed
            if (horx.test(prev.name)) {                                                     // if the old name is a config file
                handleConfigDestroy({ get: (p) => { if (p === "name") return prev.name; else return ""; } });   // call our garbage collection to remove it from state
            }
            if (horx.test(honame)) {                                                        // if the new name is a config file
                honamepart = horx.exec(honame)[1];                            // get the character name portion
                cfgho.get('notes', (notes) => { cfgIntoState({ charname: honamepart, notes: notes }) });    // baseline the config in state and parse the config handout
            }
        } else {                                                                            // names match, so either the notes were changed or this is the initialization
            honamepart = horx.exec(honame)[1];                                // extract the character name portion, convert to lowercase
            cfgho.get('notes', (notes) => { cfgIntoState({ charname: honamepart, notes: notes }) });
        }
    };
    const cfgIntoState = ({ charname: c, notes: n }) => {
        state.ia[c] = state.ia[c] || {};                                            // initialize the speaker's object in the state
        state.ia[c].cfgObj = state.ia[c].cfgObj || {};                              // initialize the config object in the speaker's state
        Object.assign(state.ia[c].cfgObj, state.ia.global.cfgObj);                  // baseline the cfgObj to the global configuration
        Object.assign(state.ia[c].cfgObj, parseConfig(n));                          // parseConfig returns an object of properties to apply to the cfgObj
    };
    const parseConfig = (notes) => {
        let cfgObj = Object.assign({}, state.ia.global.cfgObj || getDefaultConfigObj());     // make local copy of the global settings; this will be the starting point for further configurations

        notes = notes.replace(new RegExp(/&amp;|&lt;|&gt;|\\\\/, 'gi'), (e) => { return { "&amp;": "&", "&lt;": "<", "&gt;": ">", "\\": "\\" }[e]; }); // decode specific html entities that the handouts encode

        // get config components into the cfgObj
        let m = /(<!--\sBEGIN\sCONFIG\s-->.*?<!--\sEND\sCONFIG\s-->)/gmis.exec(notes);
        // group 1: config section delimted by config tags
        if (m) {
            let settings = ["css", "bg"],                               // settings available in the config section
                sdata;                                                  // to hold the data from each setting read out of the config
            settings.map(s => {
                sdata = new RegExp(`^--${s}#(.*?)(?=\r\n|\r|\n)`, 'gmis').exec(m[1]);
                //group 1: user input for the setting from --setting#user input
                if (sdata) {
                    cfgObj[s] = sdata[1];
                }
            });
        }
        return cfgObj;
    };
    const handleConfigDestroy = (cfgho) => {
        // listens for a handout deletion
        // if a config handout is deleted, revert the associated state configuration to blank/starting value
        let honame = cfgho.get('name');
        if (!horx.test(honame)) return;                                                 // if this isn't a config template, we don't care
        let honamepart = horx.exec(honame)[1].toLowerCase();                            // extract the character name portion, convert to lowercase
        if (honamepart !== "global") {                                                  // if this is an individual config, delete it from state
            state.ia[honamepart] = state.ia[honamepart] || {};
            state.ia[honamepart].cfgObj;
        } else {                                                                        // if this is the global config, reassign the global
            state.ia.global = state.ia.global || {};
            state.ia.global.cfgObj = state.ia.global.cfgObj || {};
            state.ia.global.cfgObj = getDefaultConfigObj(); 
        }
        let duphos = findObjs({ type: 'handout', name: cfgho.get('name') });            // see if there is another config of that same name we should load, now
        if (duphos.length > 0) {                                                        
            let replacecfg = duphos[0];
            replacecfg.get('notes', (notes) => { cfgIntoState({ charname: honamepart, notes: notes }) });
        }
    };
    const getIndivConfig = (theSpeaker, statesource) => {
        if (!statesource) statesource = state.ia[theSpeaker.localName] || state.ia.global;

        return Object.assign(getDefaultConfigObj(), statesource.cfgObj);
    };
    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg_orig) => {
        if (msg_orig.type !== "api") return;
        let apicatch = "";
        if (/^!(?:ia|insertarg|insertargs)(?:\s|$)/.test(msg_orig.content)) apicatch = 'ia';

        if (apicatch === "") return;

        let theSpeaker = getTheSpeaker(msg_orig);

        let args = msg_orig.content.split(/\s+--/)
            .slice(1)                                                   // get rid of api handle
            .map(splitArgs)									            // split each arg (foo:bar becomes [foo, bar])
            .map(joinVals);									            // if the value included a # (the delimiter), join the parts that were inadvertently separated

        // get the player or character's configuration (if present), or the global
        let cfgObj = getIndivConfig(theSpeaker),                        // copy the settings for this run (either from the speaker's state or the global configuration)
            cmdline = "",
            safechat = true,
            retObj = {};

        if (!args.length) {                                             // if there are no arguments, display the config
            displayIAConfig(theSpeaker, cfgObj);
            return;
        }

        let mapArg = args.shift();                                      // assign the first arg to mapArg
        if (!['button', 'chat', 'load', 'menu', 'whisper', ...Object.keys(mapArgFuncs)].includes(mapArg[0])) { // test for recognized first argument
            msgbox({ c: `First argument must come from this list:<br>button, chat, load, menu, whisper, ${Object.keys(mapArgFuncs).join(", ")}<br>Use a # to include an ability source for the command line.`, t: "UNRECOGNIZED ARGUMENT", send: true, wto: theSpeaker.localName });
            return;
        }

        let cmdSrc, allowedPlayers;
        if (mapArg[1] !== "" && !Object.keys(mapArgFuncs).includes(mapArg[0])) {                                                // value of mapArg is either (source) or character|(source) 
            cmdSrc = abilFromAmbig(mapArg[1]) || macroFromAmbig(mapArg[1].replace(/^macro\|/, ''));                             // get either the ability or macro source
            if (!cmdSrc && theSpeaker.speakerType === 'character') cmdSrc = abilFromAmbig(`${theSpeaker.id}|${mapArg[1]}`);     // if the value was a object name (rather than id) and the speaker is a character, look for that combination
            if (!cmdSrc) {
                msgbox({ c: `Could not find ${mapArg[1]}.`, t: "UNKNOWN SOURCE", send: true, wto: theSpeaker.localName });
                return;
            }
            if (cmdSrc.get('type') === 'ability') {
                allowedPlayers = getObj('character', cmdSrc.get('characterid')).get('controlledby');
            } else {
                allowedPlayers = cmdSrc.get('visibleto');
            }
            if (!allowedPlayers.split(/\s*,\s*/).includes(msg_orig.playerid) && !allowedPlayers.split(/\s*,\s*/).includes('all') && !playerIsGM(msg_orig.playerid)) {
                msgbox({ c: `You don't have rights to that source object.`, t: "ERROR", send: true, wto: theSpeaker.localName });
                return;
            }

            cmdline = cmdSrc.get('action');                             // works for both abilities and macros
        } else {                                                        // empty mapArg
            cmdline = 'show';
        }

        // CONFIG OBJECT ARGUMENTS
        args.filter((a) => { return Object.keys(cfgObj).includes(a[0].toLowerCase()) && !["table", "row"].includes(a[0].toLowerCase()); })            // deal with only the args recognized as part of the cfgObj, but not table & row
            .map((a) => {
                cfgObj[a[0].toLowerCase()] = a[1];
            });

        cfgObj.bg = validateHexColor(cfgObj.bg);

        // FIRST ARGUMENT FUNCTIONS
        if (Object.prototype.hasOwnProperty.call(mapArgFuncs, mapArg[0].toLowerCase())) {           // test if mapArg has an associated function in mapArgFuncs
            retObj = mapArgFuncs[mapArg[0]]({                                                       // call the associated function with destructuring assignment on the receiving end
                args: mapArg[1],                                                                    // parsing handled on receiving end (minimizes having to enter them individually in 2 places)
                theSpeaker: theSpeaker,
                m: msg_orig,
                cfgObj: cfgObj,
            });
            if (retObj.suspend === true) return;                                                    // should this end further processing?
            cmdline = retObj.ret || cmdline;
            safechat = !retObj.safe ? false : safechat;                                             // trip safechat if necessary
        }

        // HOOK ARGUMENTS
        args.filter( a => !Object.keys(cfgObj).includes(a[0].toLowerCase()))                        // deal with only the custom hooks (not part of cfgObj)
            .map( a => {
                retObj = cmdLineParser({ cmd: decodeUrlEncoding(a[1]), funcObj: availFuncs, m: msg_orig, cfgObj: cfgObj, theSpeaker: theSpeaker });   // recursive parser to detect and condense internal functions
                cmdline = replaceEngine(cmdline, retObj, a);                                        // insert the replacement text as specified into the cmdline around/in the hook
                return;
            });

        // OUTPUT RESULTS
        safechat = !/(?:@|\?){/gm.test(cmdline);
        cmdline = internalCallCoding(cmdline, false);
        // if user wants to ouput to the chat but it's not safe to chat, change to button
        if (['chat','whisper','menu',...Object.keys(mapArgFuncs)].includes(mapArg[0]) && !safechat) mapArg[0] = "button";
        if (!['button','load'].includes(mapArg[0])) {
            sendChat(mapArg[0] === "whisper" ? `API` : theSpeaker.chatSpeaker, (['whisper', 'menu'].includes(mapArg[0]) ? `/w "${theSpeaker.localName}" ` : "") + cmdline);
        }
        else {
            let outputStore;
            if (/^macro\|/i.test(cfgObj.store)) {                                           // user intends this to be a macro (useful for when chatting as a character, but intends to store a macro)
                outputstore = macroFromAmbig(cfgObj.store.replace(/^macro\|/, '')) || createObj('macro', { name: cfgObj.store.replace(/^macro\|/, ''), playerid: msg_orig.playerid, visibleto: msg_orig.playerid });
            } else {                                                                        // user did not explicitly call for a macro
                outputStore = abilFromAmbig(cfgObj.store) || macroFromAmbig(cfgObj.store);  // get either the ability or macro source object
                if (!outputStore && theSpeaker.speakerType === 'character') outputStore = abilFromAmbig(`${theSpeaker.id}|${cfgObj.store}`);
                if (!outputStore) {                                                         // we need to create the object
                    if (theSpeaker.speakerType === 'character') createObj('ability', { name: cfgObj.store, characterid: theSpeaker.id });
                    else createObj('macro', { name: cfgObj.store, playerid: msg_orig.playerid, visibleto: msg_orig.playerid });
                }
            }
            outputStore.set({ action: cmdline });
            if (mapArg[0] === "button") {
                sendChat("API", `/w "${theSpeaker.localName}" ${btnElem({ ...cfgObj, charname: theSpeaker.localName })}`);
            } else {
                msgbox({ c: `${outputStore.get('name')} is loaded and ready.`, t: 'COMMAND LOADED', btn: btnElem({ ...cfgObj, charname: theSpeaker.localName }), send: true, wto: theSpeaker.localName });
            }
        }
    };

    const replaceEngine = (cmdline, retObj, a) => {

        let hookrx = /^(?<before>\^\^\+\+|\+\+\^\^|\^\^|\+\+)?(?<hook>.+?)(?<after>\^\^\+\+|\+\+\^\^|\^\^|\+\+)?$/g;
        // before: ^^, ++, ^^++, or ++^^ at the beginning of [before][hook][after]
        // hook  : everything between [before] and [after] in [before][hook][after]
        // after : ^^, ++, ^^++, or ++^^ at the end of [before][hook][after]

        let delimrx = /^(.+?)\|([^|].*$|\|$)/g;
        // group 1: hook from hook|delim
        // group 2: delim from hook|delim

        let d = "", hook = "", reparray, pos = 0;

        h = hookrx.exec(a[0]);                                                              // gets the sets of info
        hookrx.lastIndex = 0;
        h.breakout = {                                                                      // break the sets down further
            before: h.groups.before && h.groups.before.indexOf("^") > -1,
            after: h.groups.after && h.groups.after.indexOf("^") > -1,
            lazy: h.groups.before && h.groups.before.indexOf("+") > -1,
            greedy: h.groups.after && h.groups.after.indexOf("+") > -1,
            hook: h.groups.hook,
        };
        if (h.breakout.before) h.breakout.after = undefined;
        hook = h.breakout.hook || "";
        if (h.breakout.lazy && delimrx.test(hook)) {
            delimrx.lastIndex = 0;
            [, hook, d] = delimrx.exec(h.breakout.hook);
            delimrx.lastIndex = 0;
        }
        d = (d.indexOf("`") === 0 && d.charAt(d.length - 1) === "`" ? d.slice(1, d.length - 1) : d);
        if (hook === 'cmd') hook = cmdline;
        if (h.breakout.lazy) {                                                              // LAZY
            reparray = retObj.ret.split(d);
            if (h.breakout.before) {								                        // lazy + before
                cmdline = cmdline.replace(new RegExp(escapeRegExp(hook), 'g'), (m => [reparray.shift() || "", m].join("")));
            } else if (h.breakout.after) {						                            // lazy + after
                cmdline = cmdline.replace(new RegExp(escapeRegExp(hook), 'g'), (m => [m, reparray.shift() || ""].join("")));
            } else {												                        // lazy + replace
                cmdline = cmdline.replace(new RegExp(escapeRegExp(hook), 'g'), (m => reparray.shift() || m));
            }
        } else if (h.breakout.greedy) {                                                     // GREEDY
            if (h.breakout.before) {								                        // greedy + before
                pos = cmdline.indexOf(hook);
                if (pos > -1) cmdline = [cmdline.slice(0, pos), retObj.ret, cmdline.slice(pos)].join("");
            } else if (h.breakout.after) {						                            // greedy + after
                pos = cmdline.indexOf(hook);
                if (pos > -1) {
                    pos += hook.length;
                    cmdline = [cmdline.slice(0, pos), retObj.ret, cmdline.slice(pos)].join("");
                }
            } else {												                        // greedy + replace
                cmdline = cmdline.replace(hook, retObj.ret);
            }
        } else {												                            // NEITHER GREEDY NOR LAZY
            if (h.breakout.before) {								                        // before
                cmdline = cmdline.replace(new RegExp(escapeRegExp(hook), 'g'), (m => [retObj.ret, m].join("")));
            } else if (h.breakout.after) {						                            // after
                cmdline = cmdline.replace(new RegExp(escapeRegExp(hook), 'g'), (m => [m, retObj.ret].join("")));
            } else {												                        // replace
                cmdline = cmdline.replace(new RegExp(escapeRegExp(hook), 'g'), retObj.ret);
            }
        }
        return cmdline;
    };

    const cmdLineParser = ({
        cmd: cmd,                // command line to process
        funcObj: obj,            // library object of functions to detect/run
        m: m,                    // message object from chat
        cfgObj: cfgObj,          // config object
        theSpeaker: theSpeaker   // the speaker from chat message
    } = {}) => {

        let indent = 0,
            index = 0,
            safe = true;

        const nestlog = (stmt, ilvl = indent) => {
            if (state.ia && state.ia.logparser === true) {
                let l = `PARSER: ${Array(ilvl + 1).join("==")}${stmt}`;
                // l = l.indexOf(":") ? '<span style="color:yellow;">' + l.slice(0, l.indexOf(":")) + ':</span>' + l.slice(l.indexOf(":") + 1) : l;
                log(l);
            };
        };
        const getFuncRegex = (obj, e = false) => {
            return new RegExp(`^${e ? '`' : ''}(${Object.keys(obj).join("|")}){{(?=}}|!!)`, 'i');
            // group 1: func from func{{arg*}}
            // if escaped, a tick (`) must preceed the func
        };


        let funcrx = getFuncRegex(obj),
            efuncrx = getFuncRegex(obj, true),
            textrx = /^(.*?)(?:}}|\s+!!|$)/,			// group 1: e from e !! --OR-- e}} --OR-- e{end of string}
            flagrx = /^\s*!!([^\s)]+)(?=\s|}})/,		// group 1: flag from !!flag
            keyrx = /^\s*!!([^\s#)]+)#[^\s]+/;		// group 1: key from !!key#anything

        const firstOf = (...args) => {
            let ret;
            args.find(f => ret = f(), ret);
            return ret;
        };

        const zeroOrMore = (f) => {
            let ret = "";
            let i = 0;
            for (; ;) {
                indent++;
                temp = f();
                indent--;
                if (!temp) {
                    nestlog(`ZERO: Has built: ${ret}`);
                    return ret;
                }
                ret += temp;
            }
        };

        const val = () => {
            let bt = index;
            let loccmd = cmd.slice(index);
            nestlog(`VAL RECEIVES: ${loccmd}`);
            indent++;
            let ret = firstOf(func, efunc, text);
            indent--;
            if (bt === 0) {
                if (cmd.slice(index).length) {
                    nestlog(`VAL: Is getting the rest: ${cmd.slice(index)}`);
                }
                ret = ret + cmd.slice(index);	// if this is the top level recursion and there is still something to grab, grab it
            }
            return ret;
        };

        const func = () => {
            let loccmd = cmd.slice(index);
            let f = funcrx.exec(loccmd);
            if (f) {
                nestlog(`FUNC DETECTS: ${f[1]}`)
                let lp = /{{/.exec(loccmd).index;
                index += lp + 2;
                indent++;
                let params = zeroOrMore(arg).trimLeft();
                indent--;
                if (cmd.charAt(index) === '}' &&
                    index + 1 < cmd.length &&
                    cmd.charAt(index + 1) === '}') {
                    nestlog(`FUNC: Running ${f[1]}{{${params}}}`);
                    let retObj = obj[f[1]]({
                        ...(Object.fromEntries((params || "")
                            .split("!!")
                            .filter(p => p !== "")
                            .map(a => a.split("#"))
                            .map(a => [a.slice(0)[0], a.slice(1).join("#").trim()]))),
                        m: m,
                        cfgObj: cfgObj,
                        theSpeaker: theSpeaker
                    });
                    index++;
                    index++;
                    nestlog(`FUNC: Returning ${retObj.ret}`);
                    if (!retObj.safe) safe = false;
                    return retObj.ret;
                }
            }
            return null;
        };

        const efunc = () => {
            let bt = index;
            let loccmd = cmd.slice(index);
            let f = efuncrx.exec(loccmd);
            if (f) {
                nestlog(`EFUNC DETECTS: ${f[1]}`)
                let lp = /{{/.exec(loccmd).index;

                let pos = lp + 1,
                    pairs = 1,
                    obraced = 0,
                    cbraced = 0;

                while (pairs !== 0 && pos < loccmd.length) {
                    pos++;
                    if (loccmd.charAt(pos) === '{') {
                        if (obraced === pos - 1) {
                            pairs++;
                            obraced = 0;
                        } else {
                            obraced = pos;
                        }
                    } else if (loccmd.charAt(pos) === '}')
                        if (cbraced === pos - 1) {
                            pairs--;
                            cbraced = 0;
                        } else {
                            cbraced = pos;
                        }
                }
                index += pos + 2;
                let ret = cmd.slice(bt + 2, index);
                nestlog(`EFUNC: Returning ${ret}`);
                return ret;
            }
            return null;
        };

        const text = () => {
            let loccmd = cmd.slice(index);
            let tb = textrx.exec(loccmd);
            if (tb) {
                nestlog(`TEXT DETECTS: ${tb[1]}`);
                index += tb[1].length;
                return tb[1];
            }
            return null;
        };

        const arg = () => {
            nestlog(`ARG RECEIVES: ${cmd.slice(index)}`);
            indent++;
            let ret = firstOf(key, flag);
            indent--;
            if (ret) return ret;
            nestlog(`ARG: Returning null.`);
            return null;
        };

        const key = () => {
            let loccmd = cmd.slice(index);
            let k = keyrx.exec(loccmd);
            if (k) {
                nestlog(`KEY DETECTS: ${k[1]}`, indent);
                let hindex = loccmd.indexOf("#");
                index += hindex + 1;
                indent++;
                let ret = ' !!' + k[1] + '#' + val();
                indent--;
                return ret;
            }
            return null;
        };

        const flag = () => {
            let loccmd = cmd.slice(index);
            let f = flagrx.exec(loccmd);
            if (f) {
                nestlog(`FLAG DETECTS: ${f[1]}`);
                let offset = loccmd.indexOf(f[1]) + f[1].length;
                index += offset;
                return ` !!${f[1]}#true`;
            }
            return null;
        };

        return { ret: val(cmd), safe: safe };
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on("change:handout", handleConfig);
        on("destroy:handout", handleConfigDestroy);
        on("change:character:name", handleCharNameChange)
    };

    on('ready', () => {
        versionInfo();
        logsig();
        registerEventHandlers();

        delete state.ia;
        state.ia = {
            global: {
                cfgObj: {}
            }
        };
        Object.assign(state.ia.global.cfgObj, getDefaultConfigObj());                           // explicitly write the defaults, because if there is a global config it will overwrite in a moment
        let cfgglobal = findObjs({ type: "handout" }).filter((h) => { return /^iaconfig-global$/gi.test(h.get('name')) })[0];
        if (cfgglobal) {
            cfgglobal.get('notes', (notes) => {
                if (notes) {
                    Object.assign(state.ia.global.cfgObj, parseConfig(notes));                  // by this time, we've asynchronously obtained the notes, so pass them to the parsing function and assign the result to the state
                }
                findObjs({ type: "handout" })                                                   // now that the global configuration is in state, process the rest of the config handouts
                    .filter((h) => { return /^iaconfig-(.+)$/gi.test(h.get('name')); })         // get only the handouts
                    .filter((h) => { return !/^iaconfig-global$/gi.test(h.get('name')) })       // filter to remove the global
                    .forEach(h => handleConfig(h, h));
            });
        } else {
            findObjs({ type: "handout" })                                                       // now that the global configuration is in state, process the rest of the config handouts
                .filter((h) => { return /^iaconfig-(.+)$/gi.test(h.get('name')); })             // get only the handouts
                .filter((h) => { return !/^iaconfig-global$/gi.test(h.get('name')) })           // filter to remove the global
                .forEach(h => handleConfig(h, { name: h.get('name') }));
        }
    });

    return {
        // public interface
        RegisterRule: registerRule,
        RegisterMenu: registerMenu,
        RegisterHelp: registerHelp,
        RunInternal: runInternal,
        BtnElem: btnElem,
        BtnAPI: btnAPI,
        MsgBox: msgbox,
        CharFromAmbig: charFromAmbig,
        AttrFromAmbig: attrFromAmbig,
        AbilFromAmbig: abilFromAmbig,
        PlayerFromAmbig: playerFromAmbig,
        MacroFromAmbig: macroFromAmbig,
        TokenFromAmbig: tokenFromAmbig,
        RepeatingFromAmbig: repeatingFromAmbig,
        ElemSplitter: elemSplitter,
        GetIndivConfig: getIndivConfig,
        HTMLCoding: htmlCoding,
        Base64: base64,
        CMDLineParser: cmdLineParser,
        GetHelpArg: getHelpArg,
        BuildOutputOptions: buildOutputOptions,
        ApplyFilterOptions: applyFilterOptions,
        ApplyFormatOptions: applyFormatOptions,
        CheckTicks: checkTicks,
        InternalCallCoding: internalCallCoding
    };

})();