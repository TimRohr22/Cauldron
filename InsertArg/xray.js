/*
=========================================================
Name			:	xray
Version			:	1.11
Last Update		:	9/5/2020
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/InsertArg
Roll20 Contact	:	timmaugh
=========================================================

XRAY
!xray --character
!xray --character#section [--pos[#number]]
!xray --read --character#elem

*/
const xray = (() => {

    // ==================================================
    //		VERSION
    // ==================================================
    const versionInfo = () => {
        const vrs = '1.11';
        const vd = new Date(1599302698567);
        log('\u0166\u0166 XRAY v' + vrs + ', ' + vd.getFullYear() + '/' + (vd.getMonth() + 1) + '/' + vd.getDate() + ' \u0166\u0166');
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
    const attrValTable = { current: "current", c: "current", max: "max", m: "max", name: "name", n: "name", a: "action", action: "action" };
    const execCharSet = ["&", "!", "@", "#", "%"];
    const btnElem = { attr: '&#64;', abil: '&#37;', attribute: '&#64;', ability: '&#37;', macro: '&#35;' };
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
    const rowbg = ["#ffffff", "#dedede"];
    const msgtable = '<div style="width:100%;"><div style="border-radius:10px;border:2px solid #000000;background-color:__bg__; margin-right:16px; overflow:hidden;"><table style="width:100%; margin: 0 auto; border-collapse:collapse;font-size:12px;">__TABLE-ROWS__</table></div></div>';
    const msg1header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td colspan = "__colspan__">__cell1__</td></tr>';
    const msg2header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td><td style="border-left:1px solid #000000;">__cell2__</td></tr>';
    const msg3header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td><td style="border-left:1px solid #000000;">__cell2__</td><td style="border-left:1px solid #000000;">__cell3__</td></tr>';
    const msg1row = '<tr style="background-color:__bg__;"><td style="padding:4px;"><div style="__row-css__">__cell1__</div></td></tr>';
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
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };

    const htmlCoding = (s = "", encode = true) => {
        if (typeof s !== "string") return undefined;
        let searchfor = encode ? htmlTable : _invert(htmlTable);
        s = s.replace(new RegExp(Object.keys(searchfor)
            .map((k) => { return escapeRegExp(k); })
            .join("|"), 'gmi'), (r) => { return searchfor[r]; })
            .replace(new RegExp(/\n/, 'gmi'), '<br><br>');
        return s;
    };

    const Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (e) {
            var t = "";
            var n, r, i, s, o, u, a;
            var f = 0;
            e = Base64._utf8_encode(e);
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
            t = Base64._utf8_decode(t);
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

    const xraysheet = ({
        // for a given character, returns a list of the repeating sections, an entry for basic attributes, and one for abilities
        character: character,                                           // character
        css: css = "",                                                  // free input css for api button
        bg: bg = "",                                                    // background color for api button
        theSpeaker: theSpeaker,
        cfgObj: cfgObj
    } = {}) => {
        let msg = '', btn = '';
        bg = !bg ? cfgObj.bg : bg;
        css = !css ? cfgObj.css : css;

        let sectionRX = /^repeating_([^_]+?)_.+$/g;
        // group 1: section from repeating_section_attributeID_suffix
        let sections = findObjs({ type: 'attribute', characterid: character.id })
            .filter(a => {                                              // filter where the regex matches
                sectionRX.lastIndex = 0;
                return sectionRX.test(a.get('name'));
            })
            .map(a => {                                                 // extract section (group 1 of the regex)
                sectionRX.lastIndex = 0;
                return sectionRX.exec(a.get('name'))[1];
            });
        if (!sections.length) {
            btn = ia.BtnAPI({ bg: bg, api: `!xray`, label: 'Try Again', css: css });
            msg = `xray: No repeating sections for ${character.get('name')}.`;
            ia.MsgBox({ c: msg, t: 'NO SECTIONS', btn: btn, send: true, wto: theSpeaker.localName });
            return;
        }
        let uniquekeys = [...new Set(sections)];                        // get an array of unique values

        let retval = "",
            sectiontable = msgtable.replace("__bg__", rowbg[0]),
            sectionheader = msg1header.replace("__colspan__", '2').replace("__bg__", rowbg[1]).replace("__cell1__", `XRAY: ${character.get('name').toUpperCase()}`) + msg2header.replace("__bg__", rowbg[1]).replace("__cell1__", "GROUP").replace("__cell2__", "XRAY"),
            rowtemplate = msg2row;
        let apixray = `!xray --${character.id}#__section__ --0#25`;
        let btnabil = ia.BtnAPI({ bg: bg, api: apixray.replace('__section__', 'ability'), label: "XRay", charid: character.id, css: css });
        let btnattr = ia.BtnAPI({ bg: bg, api: apixray.replace('__section__', 'attribute'), label: "XRay", charid: character.id, css: css });

        sectionheader += rowtemplate.replace("__bg__", rowbg[0]).replace("__cell1__", 'Abilities').replace("__cell2__", btnabil);
        sectionheader += rowtemplate.replace("__bg__", rowbg[1]).replace("__cell1__", 'Attributes').replace("__cell2__", btnattr);
        let attrrows = uniquekeys.reduce((a, val, i) => {
                retval = val;
                if (typeof retval === "string" && retval !== "") {
                    apixray = `!xray --${character.id}#${val} --?{At position...|0}`;
                    retval = ia.BtnAPI({ bg: bg, api: apixray, label: "XRay", charid: character.id, css: css });
                }
                return a + rowtemplate.replace("__bg__", rowbg[(i % 2)]).replace("__cell1__", val).replace("__cell2__", retval);
            }, sectionheader);
        sendChat('API', `/w ${theSpeaker.localName} ${sectiontable.replace("__TABLE-ROWS__", attrrows)}`);
        return;
    };
    const xraysection = ({
        // provides a cross-section view of a given element of a repeating series at position "pos"
        // for instance, all of the sub-attributes of a spell in a repeating section "spells"
        s: s = "",                                          // section
        v: v = "c",                                         // attribute value to retrieve (c: current, m: max, n: name)
        character: character,                               // character object (should be identified by now)
        css: css = "",                                      // free input css for api button
        bg: bg = "",                                        // background color for api button
        pos: pos = 0,                                       // position of element to check in repeating list
        cfgObj: cfgObj,                                     // configuration settings
        theSpeaker: theSpeaker,                             // speaker object from the message
    } = {}) => {
        if (!bg) bg = cfgObj.bg;
        if (!css) css = cfgObj.css;

        let sectionRX = new RegExp(`repeating_${s}_([^_]*?)_.*$`);
        // group 1: attributeID from repeating_section_attributeID_suffix
        let attrsinrep = findObjs({ type: 'attribute', characterid: character.id }).filter(r => sectionRX.test(r.get('name')));
        if (!attrsinrep.length) {
            ia.MsgBox({ c: `xray: No elements in ${s}.`, t: `NO RETURN`, send: true, wto: theSpeaker.localName });
            return;
        }
        let uniquekeys = [...new Set(attrsinrep.map(a => sectionRX.exec(a.get('name'))[1]) )];        // extract attributeID (group 1 of the regex), then get an array of unique values
        pos = Number(pos);
        if (isNaN(pos)) {
            ia.MsgBox({ c: `xray: Argument 'pos' not recognized as number.`, t: `INVALID POSITION`, send: true, wto: theSpeaker.localName });
            return;
        }
        if (pos >= uniquekeys.length || pos < 0) {
            ia.MsgBox({ c: `Argument 'pos' out of scope. Min value is 0. Max value for this character is ${uniquekeys.length - 1}.`, t: `INVALID POSITION`, send: true, wto: theSpeaker.localName });
            return;
        }
        
        let suffixRX = new RegExp(`^repeating_${s}_${uniquekeys[pos]}_(.*)$`);
        // group 1: suffix from repeating_section_attributeID_suffix
        let attrs = findObjs({ type: 'attribute', characterid: character.id }).filter(r => suffixRX.test(r.get('name')));
        let nameguessRX = new RegExp(`^repeating_${s}_${uniquekeys[pos]}_(.*?name.*)$`);
        // group 1: suffix that contains 'name'
        let attr_nameguess = attrs.filter(r => nameguessRX.test(r.get('name'))).map(r => nameguessRX.exec(r.get('name'))[1])[0] || "";      // filter where the word 'name' is in the suffix, [1] is the group bearing the suffix, [0] is to grab the first attribute that matches

        let retval = "",
            menufor = "",
            menuapi = "",
            attrtable = msgtable.replace("__bg__", rowbg[0]),
            attrheader = msg1header.replace("__colspan__", '3').replace("__bg__", rowbg[1]).replace("__cell1__", `XRAY: ${character.get('name').toUpperCase()}: ${s}`) + msg3header.replace("__bg__", rowbg[1]).replace("__cell1__", "SUFFIX").replace("__cell2__","MENU").replace("__cell3__", (attrValTable[v] || attrValTable.c).toUpperCase()),
            rowtemplate = msg3row,
            attrrows = attrs.reduce((a, val, i) => {
                retval = val.get(attrValTable[v] || attrValTable.c);
                menufor = "";
                menuapi = "";
                if (typeof retval === "string" && retval !== "") {
                    if (execCharSet.includes(retval.charAt(0))) {                   // look for executable statements, if found, we will construct 3 buttons
                        retval = ia.BtnAPI({ bg: bg, api: `!xray --read --${character.id}#${val.get('name')}`, label: "View", charid: character.id, css: css }) + " " +
                            ia.BtnElem({ bg: bg, store: val.get('name'), label: "Exec", charname: character.get('name'), entity: btnElem.attr, css: css });
                        menuapi = `!ia --whisper --show#msgbox{{!!c#The following elements were found in ${s}. This list can be further refined. !!t#ELEMENTS !!btn#getrepeating{{!!s#${s} !!sfxn#?{Naming attribute|${attr_nameguess}} !!sfxa#${suffixRX.exec(val.get('name'))[1]} !!c#${character.id} !!op#b !!f#n}} !!send#true !!wto#${theSpeaker.localName}}}`;
                        menufor = ia.BtnAPI({ bg: bg, api: menuapi, label: "Build", charid: character.id, css: css });
                    } else {                                                        // just text, so encode it so it doesn't break the output
                        retval = htmlCoding(retval, true);
                    }
                }
                return a + rowtemplate.replace("__bg__", rowbg[(i % 2)]).replace("__cell1__", suffixRX.exec(val.get('name'))[1]).replace("__cell2__",menufor).replace("__cell3__", retval);
            }, attrheader);
        let apixray = pos === 0 ? '' : `!xray --${character.id}#${s} --${pos-1}`;
        let pbtn = apixray ? ia.BtnAPI({ bg: bg, api: apixray, label: "PREV", charid: character.id, css: css }) : '';

        apixray = pos === uniquekeys.length - 1 ? '' : `!xray --${character.id}#${s} --${pos + 1}`;
        let nbtn = apixray ? ia.BtnAPI({ bg: bg, api: apixray, label: "NEXT", charid: character.id, css: css }) : '';
        let msg = `${attrtable.replace("__TABLE-ROWS__", attrrows)}<div style="width:100%;overflow:hidden;"><div style="float:left;text-align:left;width:50%;display:inline-block;">${pbtn}</div><div style="float:right;text-align:right;width:50%;display:inline-block;">${nbtn}</div></div>`;
        sendChat('API', `/w ${theSpeaker.localName} ${msg}`);
        return;
    };
    const xraystandard = ({
        // provides a listing of non-repeating attributes or abilities from position "pos"
        // number of objects to show determined by "num" parameter
        s: s = "attribute",                                 // section
        v: v = "c",                                         // attribute value to retrieve (c: current, m: max; a: action)
        character: character,                               // character object (should be identified by now)
        css: css = "",                                      // free input css for api button
        bg: bg = "",                                        // background color for api button
        ord: ord = 'a',                                     // sort order for returned objects
        pos: pos = 0,                                       // position of element to check in repeating list
        cfgObj: cfgObj,                                     // configuration settings
        theSpeaker: theSpeaker,                             // speaker object from the message
        num: num = 25                                       // number of objects to show in one go
    }) => {
        if (!bg) bg = cfgObj.bg;
        if (!css) css = cfgObj.css;
        ord = ['d', 'a'].includes(ord) ? ord : 'n';         // anything other than 'a' (ascending) or 'd' (descending) triggers no sort order
        v = ['m', 'max'].includes(v) ? 'max' : 'current';   // catch all attributes... and...
        v = s === 'ability' ? 'action' : v;                 // correct for abilities (if necessary)
        let sheetObjs = findObjs({ type: s, characterid: character.id });
        if (s === 'attribute') sheetObjs = sheetObjs.filter(a => !a.get('name').startsWith('repeating'));
        switch (ord) {
            case 'a':
                sheetObjs = sheetObjs.sort((a, b) => a.get('name') > b.get('name') ? 1 : -1);
                break;
            case 'd':
                sheetObjs = sheetObjs.sort((a, b) => a.get('name') > b.get('name') ? -1 : 1);
                break;
            case 'n':
            default:
                break;
        }
        pos = parseInt(pos);
        if (isNaN(pos)) {
            ia.MsgBox({ c: `xray: Argument 'pos' not recognized as number.`, t: `INVALID POSITION`, send: true, wto: theSpeaker.localName });
            return;
        }
        if (pos >= sheetObjs.length || pos < 0) {
            ia.MsgBox({ c: `Argument 'pos' out of scope. Min value is 0. Max value for this character is ${sheetObjs.length - 1}.`, t: `INVALID POSITION`, send: true, wto: theSpeaker.localName });
            return;
        }
        if (num === 'all' || isNaN(Number(num))) {
            pos = 0;
            num = sheetObjs.length;
        } else {
            num = parseInt(num);
            if (num + pos > sheetObjs.length) num = sheetObjs.length - pos;
        }

        let allObjsCount = sheetObjs.length;
        sheetObjs = sheetObjs.slice(pos, pos+num);

        let retval = "",
            menufirst5 = "",
            menulast5 = "",
            menuapi = "",
            attrtable = msgtable.replace("__bg__", rowbg[0]),
            attrheader = msg1header.replace("__colspan__",'3').replace("__bg__",rowbg[1]).replace("__cell1__",`XRAY: ${character.get('name').toUpperCase()}: ${s}`) + msg3header.replace("__bg__", rowbg[1]).replace("__cell1__", s.toUpperCase()).replace("__cell2__", "MENU").replace("__cell3__", attrValTable[v].toUpperCase()),
            rowtemplate = msg3row,
            outputrows = sheetObjs.reduce((a, val, i) => {
                retval = val.get(attrValTable[v]);
                menufirst5 = "";
                menulast5 = "";
                menuapi = "";
                if (typeof retval === "string" && retval !== "") {
                    if (execCharSet.includes(retval.charAt(0)) || s === 'ability') {                   // look for executable statements, if found, we will construct 4 buttons
                        retval = ia.BtnAPI({ bg: bg, api: `!xray --read --${character.id}#${val.get('name')}`, label: "View", charid: character.id, css: css }) + " " +
                            ia.BtnElem({ bg: bg, store: val.get('name'), label: "Exec", charname: character.get('name'), entity: btnElem[s], css: css });
                        menuapi = `!ia --whisper --show#msgbox{{!!c#The following ${s === 'attribute' ? 'attributes' : 'abilities'} were found matching the first 5 characters of the chosen ${s}. This list can be further refined. !!t#ELEMENTS !!btn#get${s.slice(0, 4)}s{{!!c#${character.id} !!op#b !!f#${s === 'attribute' ? 'x#' : ''}^f#\`${val.get('name').slice(0, 5)}\`}} !!send#true !!wto#${theSpeaker.localName}}}`;
                        menufirst5 = ia.BtnAPI({ bg: bg, api: menuapi, label: "Starts", charid: character.id, css: css });
                        menuapi = `!ia --whisper --show#msgbox{{!!c#The following ${s === 'attribute' ? 'attributes' : 'abilities'} were found matching the last 5 characters of the chosen ${s}. This list can be further refined. !!t#ELEMENTS !!btn#get${s.slice(0, 4)}s{{!!c#${character.id} !!op#b !!f#${s === 'attribute' ? 'x#' : ''}f^#${val.get('name').slice(-5)}}} !!send#true !!wto#${theSpeaker.localName}}}`;
                        menulast5 = ia.BtnAPI({ bg: bg, api: menuapi, label: "Ends", charid: character.id, css: css });
                    } else {                                                        // just text, so encode it so it doesn't break the output
                        retval = htmlCoding(retval, true);
                    }
                }
                return a + rowtemplate.replace("__bg__", rowbg[(i % 2)]).replace("__cell1__", val.get('name')).replace("__cell2__", `${menufirst5} ${menulast5}`).replace("__cell3__", retval);
            }, attrheader);
        let apixray = parseInt(pos) - parseInt(num) < 0 ? '' : `!xray --${character.id}#${s} --${parseInt(pos) - parseInt(num)}#${num}`;
        let pbtn = apixray ? ia.BtnAPI({ bg: bg, api: apixray, label: "PREV", charid: character.id, css: css }) : '';

        apixray = parseInt(pos) + parseInt(num) >= allObjsCount ? '' : `!xray --${character.id}#${s} --${parseInt(pos) + parseInt(num)}#${num}`;
        let nbtn = apixray ? ia.BtnAPI({ bg: bg, api: apixray, label: "NEXT", charid: character.id, css: css }) : '';
        let msg = `${attrtable.replace("__TABLE-ROWS__", outputrows)}<div style="width:100%;overflow:hidden;"><div style="float:left;text-align:left;width:50%;display:inline-block;">${pbtn}</div><div style="float:right;text-align:right;width:50%;display:inline-block;">${nbtn}</div></div>`;
        sendChat('API', `/w ${theSpeaker.localName} ${msg}`);
        return;

    };
    const viewxray = ({
        // for a given character and element, returns a message box to let you read it
        character: character,                                           // character
        elem: elem,                                                     // the sheet object to read
        css: css = "",                                                  // free input css for api button
        bg: bg = "",                                                    // background color for api button
        theSpeaker: theSpeaker,
        cfgObj: cfgObj
    } = {}) => {
        let obj = ia.AbilFromAmbig(`${character}|${elem}`) || ia.AttrFromAmbig(`${character}|${elem}`);
        if (!obj) {
            ia.MsgBox({ c: 'Could not find that sheet object.', t: 'NO SUCH ELEMENT', send: true, wto: theSpeaker.localName });
            return;
        }
        ia.MsgBox({ c: htmlCoding(obj.get('type') === 'attribute' ? obj.get('current') : obj.get('action'), true), t: `TEXT OF ${obj.get('name')}`, send: true, wto: theSpeaker.localName });
        return;
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg_orig) => {
        if (!(msg_orig.type === "api" && /^!xray(?:\s|$)/.test(msg_orig.content))) return;

        let theSpeaker = getTheSpeaker(msg_orig);
        let cfgObj = ia.GetIndivConfig(theSpeaker);
        let bg = cfgObj.bg;
        let css = cfgObj.css;

        let args = msg_orig.content.split(/\s+--/)
            .slice(1)                                                   // get rid of api handle

        let charsICon = findObjs({ type: 'character' });
        if (!playerIsGM(msg_orig.playerid)) {                                // if the player isn't GM, limit to players they control
            charsICon = charsICon.filter(c => {
                return c.get('controlledby').split(/\s*,\s*/).includes(msg_orig.playerid) || c.get('controlledby').split(/\s*,\s*/).includes('all');
            });

        }

        if (!charsICon.length) {
            ia.MsgBox({ c: `xray: It doesn't look like you control any characters. Fix that and try again.`, t: `NO CHARACTERS`, send: true, wto: theSpeaker.localName });
            return;
        }

        charsICon = charsICon.sort((a, b) => a.get('name') > b.get('name') ? 1 : -1);

        const charsAvailForXray = (send = true) => {
            btn = charsICon.map(c => ia.BtnAPI({ bg: bg, api: `!xray --${c.id}`, label: c.get('name'), css: css })).join(" ");
            msg = `These characters are in your waiting room waiting for their xray. Click on one to continue.`;
            return ia.MsgBox({ c: msg, t: 'AVAILABLE CHARACTERS', btn: btn, send: send, wto: theSpeaker.localName });
        };

        let msg = "", btn = "";
        if (!args.length) {
            charsAvailForXray();
            return;
        }

        const getCharAndSection = (arg) => {
            let [character, item] = arg.split("#");
            character = charsICon.filter(c => c.id === (ia.CharFromAmbig(character) || { id: 0 }).id)[0];
            if (character && item) {
                switch (item) {
                    case 'ability':
                    case 'abilities':
                        item = 'ability';
                        break;
                    case 'attribute':
                    case 'attributes':
                        item = 'attribute';
                        break;
                    default:
                        item = findObjs({ type: 'attribute', characterid: character.id }).filter(a => new RegExp(`^repeating_${item}_.*`, 'g').test(a.get('name'))).length ? item : '';
                        if (!item) ia.MsgBox({ c: `xray: No section found to match ${mapArg}.`, t: `NO SECTION`, send: true, wto: theSpeaker.localName });
                        break;
                }
            }
            return [character, item];
        };

        let action = 'scan', character, section, elem, pos = 0, num = 0;

        let mapArg = args.shift();                                      // assign the first arg to mapArg
        if (mapArg === 'read') {
            action = 'read';
            [character, elem] = args.shift().split("#");
        } else if (mapArg.indexOf('#' > -1)) {                          // if there is a hash, we have a character and section
            [character, section] = getCharAndSection(mapArg);
        } else {                                                        // if we didn't have a character and a section, we should have a character, only
            character = ia.CharFromAmbig(mapArg);
        }
        if (!character) {
            ia.MsgBox({ c: `xray: No character found among those you can control for ${mapArg}.`, t: `NO CHARACTER`, send: true, wto: theSpeaker.localName });
            charsAvailForXray();
            return;
        }
        if (action === 'scan' && args.length) {
            [pos = 0, num = 0] = args.shift().split("#");               // validation and sanitation of these values is handled in the appropriate called function (since they require the set of objects to review)
        }
        // by now, we have filled action, character, section and/or elem, pos, and num; we just have to output the correct information
        if (action === 'scan') {
            if (!character) {                                           // scan, but no character, so give all characters the player controls
                charsAvailForXray();
                return;
            }
            if (section) {                                              // character + section
                switch (section) {
                    case 'ability':                                     // 'abilities' has been flattened to 'ability' by now 
                        xraystandard({ s: 'ability', character: character, css: css, bg:bg, pos: pos, num: num, cfgObj: cfgObj, theSpeaker: theSpeaker });
                        break;
                    case 'attribute':                                   // 'attributes' has been flattened to 'attribute' by now
                        xraystandard({ s: 'attribute', character: character, css: css, bg: bg, pos: pos, num: num, cfgObj: cfgObj, theSpeaker: theSpeaker });
                        break;
                    default:
                        xraysection({ s: section, character: character, cfgObj: cfgObj, theSpeaker: theSpeaker, pos: pos });
                }
            } else {                                                    // character, no section = output available sections
                xraysheet({ character: character, css: css, bg: bg, theSpeaker: theSpeaker, cfgObj: cfgObj });
            }
        } else if (action === 'read') {
            if (!elem) {
                ia.MsgBox({ c: `xray: No sheet item provided for read operation.`, t: `NO ITEM`, send: true, wto: theSpeaker.localName });
                return;
            }
            viewxray({ character: character, elem: elem, theSpeaker: theSpeaker, cfgObj: cfgObj, bg: bg, css: css });
        }

        return;
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        versionInfo();
        logsig();
        registerEventHandlers();

    });

    return {
        // public interface
    };

})();