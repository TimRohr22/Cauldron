/*
=========================================================
Name			:	InsertArgs (insertargs)
Version			:	0.3
Last Update		:	7/6/2020
GitHub			:	
Roll20 Contact	:	timmaugh
=========================================================

TO DO:
----- give whisper output capability
----- html encoding for hook - either all or nested only... double encode?
----- add "XRay of... {character name}" to the top of xrays/xreads
----- automate building handout to store/read html for menu (using default menutable and menurow)
----- hardcode "load" as necessary to drop the finished command line into the InsertArgs attribute
----- in game help panel of api buttons to set options and/or start xrays (using speaker id or target)
----- give option to set global default settings and/or personal default settings (color, button css)
----- button to view the constructed list/query (or just send it encoded in a message box)
----- test various circumstances of character name changes and handout name changes, with [0, 1, many] config name conflicts
----- work through speaker vs character -- any place where we've taken it for granted?
----- check controlledby property of handout before you change it
----- add controlledby setting to handout when it is created

*/
const insertarg = (() => {
    'use strict';

    // ==================================================
    //		VERSION
    // ==================================================
    const versionInfo = () => {
        const vrs = '0.3';
        const vd = new Date(1593894334151);
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
    const attrValTable = { c: "current", m: "max", n: "name" };
    const execCharSet = ["&", "!", "@", "#", "%"];
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
    };
    const rowbg = ["#ffffff", "#dedede"];
    const bgcolor = "#ff9747";
    const menutable = '<!-- BEGIN TABLE --><div style="width:100%;font-family:&quot;Arial Narrow&quot;, Calibri, Consolas, cursive" ; font-size:12px;><div style="border-radius:10px;background-color:__HDR-BG-COLOR__; margin-right:16px; margin-top:16px; position:relative; overflow:visible;"><div style="font-size: 18px; line-height:20px; color: #ffffff;text-align:left;width:95%; margin:auto;padding:4px;font-weight:bold;">__CHAR-NAME__</div><div style="height:16px; width:28px; border-radius: 6px; background-color:__ALT-COLOR__;color:__ALT-TEXT-COLOR__;text-align: center;line-height:16px;font-size:10px;position:absolute; right:-14px; top:-7px;">XRay</div>__TABLE-ROWS__<div style="line-height:10px;">&nbsp;</div></div></div><!-- END TABLE -->';
    const menurow = '<!-- BEGIN ROW --><div style="background-color:__ROW-BG-COLOR__;color:#000000;border:solid __HDR-BG-COLOR__; border-width: 0px 1px;display:block;overflow:hidden;"><div style="width:95%;margin:auto;"><div style="float:left;width:30%;display:inline-block;font-weight:bold;">__SECTION-NAME__</div><div style="float:left;width:70%;display:inline-block;">__BUTTONS__</div></div></div><!-- END ROW -->';
    const msgtable = '<div style="width:100%;"><div style="border-radius:10px;border:2px solid #000000;background-color:__bg__; margin-right:16px; overflow:hidden;"><table style="width:100%; margin: 0 auto; border-collapse:collapse;font-size:12px;">__TABLE-ROWS__</table></div></div>';
    const msg1header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td></tr>';
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
        characters.forEach((chr) => { if (chr.get('name') == msg.who) speaking = chr; });

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
    const splitArgs = (a) => { return a.split("#") };
    const joinVals = (a) => { return [a.slice(0)[0], a.slice(1).join("#").trim()]; };
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const decodeUrlEncoding = (t) => {                                              // TO DO - this is supposed to handle handout decoding test with not-pre-formatted text
        return t.replace(/%([0-9A-Fa-f]{1,2})/g, (f, n) => { return String.fromCharCode(parseInt(n, 16)); });
    }

    const getAltColor = (primarycolor, fade = .35) => {
        let pc = hexToRGB(primarycolor);
        let sc = [0, 0, 0];

        for (let i = 0; i < 3; i++) {
            sc[i] = Math.floor(pc[i] + (fade * (255 - pc[i])));
        }

        return RGBToHex(sc[0], sc[1], sc[2]);
    };
    const getTextColor = (h) => {
        let hc = hexToRGB(h);
        return (((hc[0] * 299) + (hc[1] * 587) + (hc[2] * 114)) / 1000 >= 128) ? "#000000" : "#ffffff";
    };
    const hexToRGB = (h) => {
        let r = 0, g = 0, b = 0;

        // 3 digits
        if (h.length == 4) {
            r = "0x" + h[1] + h[1];
            g = "0x" + h[2] + h[2];
            b = "0x" + h[3] + h[3];
            // 6 digits
        } else if (h.length == 7) {
            r = "0x" + h[1] + h[2];
            g = "0x" + h[3] + h[4];
            b = "0x" + h[5] + h[6];
        }
        return [+r, +g, +b];
    };
    const validateHexColor = (s) => {
        let colorRegX = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i;
        return '#' + (colorRegX.test(s) ? s.replace('#', '') : 'ff9747');
    };

    const apibutton = ({ bg: btnbg = bgcolor, store: s = "InsertArg", label: btnlabel = "Loaded Ability", charname: cn = "not set", entity: e = "&#37;", css: css = "" } = {}) => {
        btnbg = validateHexColor(btnbg);
        return `<a style="background-color: ${btnbg}; color: ${getTextColor(btnbg)}; min-width:25px; border-radius: 6px; padding: 6px 8px; font-family:&quot;Arial Narrow&quot;, Calibri, Consolas, cursive;${css}" href="!&#13;${e}{${cn}|${s}}">${btnlabel}</a>`;
    };
    const apibutton_xread = ({ bg: btnbg = bgcolor, store: s = "InsertArg", label: btnlabel = "View", charid: cid = "not set", css: css = "" } = {}) => {
        btnbg = validateHexColor(btnbg);
        return `<a style="background-color: ${btnbg}; color: ${getTextColor(btnbg)}; min-width:25px; border-radius: 6px; padding: 6px 8px; font-family:&quot;Arial Narrow&quot;, Calibri, Consolas, cursive;${css}" href="!xray --readxray_${cid}(${s})">${btnlabel}</a>`;
    };
    const apibutton_api = ({ bg: btnbg = bgcolor, api: api = "", label: btnlabel = "Run API", css: css = "" } = {}) => {
        btnbg = validateHexColor(btnbg);
        api = htmlCoding(api, true);
        return `<a style="background-color: ${btnbg}; color: ${getTextColor(btnbg)}; min-width:25px; border-radius: 6px; padding: 6px 8px; font-family:&quot;Arial Narrow&quot;, Calibri, Consolas, cursive;${css}" href="${api}">${btnlabel}</a>`;
    };

    const copystr = (s) => { return (" " + s).slice(1); };
    const msgOutput = ({ c: c="chat message", t: t = "title", btn: b = "buttons", send: send = false, sendas: sas = "API", wto: wto = ""  } = {}) => {
        let tbl = copystr(msgtable).replace("__bg__", rowbg[0]);
        let hdr = copystr(msg1header).replace("__bg__", rowbg[1]).replace("__cell1__", t);
        let row = copystr(msg1row).replace("__bg__", rowbg[0]).replace("__cell1__", c);
        let btn = b !== "buttons" ? copystr(msg1row).replace("__bg__", rowbg[0]).replace("__cell1__", b).replace("__row-css__", "text-align:right;margin:4px 4px 8px;") : "";
        let msg = tbl.replace("__TABLE-ROWS__", hdr + row + btn);
        if (wto) msg = `/w "${wto}" ${msg}`;
        if (["t", "true", "y", "yes", true].includes(send)) {
            sendChat(sas, msg);
        } else {
            return msg;
        }
    };
    const htmlCoding = (s = "", encode = true) => {
        if (typeof s !== "string") return undefined;
        let searchfor = encode ? htmlTable : _invert(htmlTable);
        s = s.replace(new RegExp(Object.keys(searchfor)
            .map((k) => { return escapeRegExp(k); })
            .join("|"), 'gmi'), (r) => { return searchfor[r]; })
            .replace(new RegExp(/\n/,'gmi'),'<br><br>');
        return s;
    };

    // ==================================================
    //		AVAILABLE INTERNAL FUNCTIONS
    // ==================================================
    //      each function should be built using deconstruction assignment, which will provide immediate !!arg availability to each parameter
    //      each function should return an object of { ret:the text constructed, safe: whether it's safe to chat }
    //      once built, enter it in the library object availFuncs to make it available to users (below functions)

    const gettargets = ({ n: n = 1,                                     // number of targets
                          d: d = " "                                    // delimiter (default is space)
                        } = {}) => {
        let r = (Array(Number(n)).fill(0).reduce((a, v, i) => { return a + `@{target|Target ${i + 1}|token_id}${d}`; }, "")).trim();
        return { ret: r, safe: false };
    };
    const targetsel = ({   m: m,                                        // msg object
                           d: d = " "                                   // delimiter (default is space)
                       } = {}) => {
        let r = "";
        if (m.selected) r = m.selected.reduce((a, v, i) => { return a + v._id + d; }, "").trim();
        return { ret: r, safe: true };
    };
    const getrepeating = ({   s: s = "",                                // repeating section
                              sfxn: sfxn = "",                          // suffix denoting name attribute for a given attribute in a repeating section
                              sfxa: sfxa = "",                          // suffix denoting action attribute for a given attribute in a repeating section
                              t: t = "",                                // token id
                              cid: cid = "",                            // character id
                              cn: cn = "",                              // character name
                              d: d = " ",                               // delimiter (default is space)
                              op: op = "",                              // how to output (b: button, q: query, n: nested query, [default]/[none]: delimited list)
                              v: v = "c",                               // attribute value to retrieve (c: current, m: max, n: name)
                              bg: bg,                                   // background color for api button
                              store: store,                             // where the output will be stored
                              label: label,                             // label for api button
                              theSpeaker: theSpeaker,                   // speaker -- separate from cn, above (leaving in for future scalability)
                              css: css = "",                            // free input css for api button
                              ex: ex = "true",                          // whether to include only actionable attributes
                              cfgObj: cfgObj,                           // configuration settings
                          } = {}) => {

        let retObj = { ret: "", safe: true },
            character = { fail: true };
        if (cid) {
            character = findObjs({ type: 'character', id: cid })[0] || { fail: true };
        } else if (cn) {
            character = findObjs({ type: 'character' }).filter((chr) => { return chr.get('name') === cn; })[0] || { fail: true };
        } else if (t) {
            character = findObjs({ type: 'character', id: (getObj("graphic", t)).get("represents") })[0] || { fail: true };
        }
        if (character.hasOwnProperty("fail")) return retObj;

        if (!bg) bg = cfgObj.bg;
        if (!css) css = cfgObj.css;

        ["true", "t", "y", "yes"].includes(ex) ? ex = true : ex = false;
        let repRX = new RegExp(`repeating_${s}_([^_]*?)_${sfxn}$`);
        // group 1: repID from repeating_section_repID_suffix
        let attrs = findObjs({ type: 'attribute', characterid: character.id })
            .filter((r) => { return repRX.test(r.get('name')); })
            .map((a) => { return { attrobj: a, exec: `repeating_${s}_${repRX.exec(a.get('name'))[1]}_${sfxa}`, val: a.get(attrValTable[v] || attrValTable.c) }; })
            .filter((a) => { return ex ? execCharSet.includes(getAttrByName(character.id, a.exec).charAt(0)) : true});    // if ex is tripped (only executable), test the executable element of the repeating section for the presence of an executing character (& or !)

        // we should now have an array of objects of the form {attriute object, the name of the associated executable attribute, the requested value of the given attribute}
        if (!attrs.length) return retObj;

        switch (op.charAt(0)) {
            case "b":
                retObj.ret = attrs.map((a) => { return apibutton({ bg: bg, store: a.exec, label: a.val, charname: character.get('name'), entity: "&#64;", css: css }) })
                    .join(d);
                break;
            case "q":
            case "n":
                let localhtml = { ",": ",", "|": "|", "}": "}" };       // initialize the replacement table to have no replacements (a:a)
                if (op === "n") localhtml = htmlTable;                  // if we're in a nested query, get the replacement values
                retObj.ret = attrs.map((a) => { return `${a.val}${localhtml[',']}${getAttrByName(character.id, a.exec).replace(new RegExp(/,|}|\|/, 'gmi'), (r) => { return htmlTable[r]; })}` })
                    .join(localhtml["|"]);
                break;
            default:
                retObj.ret = attrs.map((a) => { return a.val }).join(d);
                break;
        }
        return retObj;
    };

    // const rptHook (produce repeating hook (seed + iteration)... will need a "output to repeating hook" function, too)

    // ----------- AVAILABLE FUNCTION LIBRARY -----------
    const availFuncs = {                                                // library of available functions as prop:func
        gettargets: gettargets,
        targetsel: targetsel,
        getrepeating: getrepeating
    };

    // ==================================================
    //		FIRST ARGUMENT FUNCTIONS
    // ==================================================
    //      these functions are for special values provided to the first argument
    //      each function should be built using deconstruction assignment, which will provide immediate !!arg availability to each parameter
    //      each function should return an object in the form of { ret: compiled text, safe: true/false, suspend: true/false }
    //      once built, enter it in the library object abilFuncs to make it available to users

    const processHandout = ({ args: args, m: m, theSpeaker: theSpeaker, cfgObj: cfgObj } = {}) => {
        let retObj = { ret: "", safe: true, suspend: true };

        // available functions to the handout process
        const rename = ({ oldn: oldn,                           // old handout name, if provided
                          oldid: oldid,                         // old handout id, if provided
                          nn: nn = "",                          // new handout name
                          cfgObj: cfgObj,                       // config settings
                        } = {}) => {

            if (!nn) {                                          // no new name provided
                msgOutput({ c: "Unable to rename: no new name provided.", t: "ERROR", send: true });
            } else {
                let ho,
                    btn = "",
                    msg = "";
                if (oldn) {                                     // user provided old handout name
                    ho = findObjs({ type: 'handout', name: oldn });
                    if (ho.length < 1) {
                        msg = "No handout found with that name.";
                    } else if (ho.length > 1) {
                        let api = `http://journal.roll20.net/handout/`;
                        msg = "Multiple handouts have that name. You're going to have to figure this out on your own.";
                        btn = ho.reduce((a, v, i) => { return a + apibutton_api({ bg: cfgObj.bg, api: api + v.id, label: `(${i+1}) ${v.get('name').replace(/iaconfig-/i, "")}`, css: "min-width: 25px;" + cfgObj.css }) + ' ' }, "");
                    }
                } else if (oldid) {                             // user provided old handout id
                    ho = findObjs({ type: 'handout', id: oldid });
                    if (ho.length < 1) {
                        msg = "No handout found with that id.";
                    }
                }
                if (msg) {                                      // if there is a message (an error), output it and exit
                    msgOutput({ c: msg, t: "ERROR", send: true, btn: btn, wto: theSpeaker.localName });
                    return retObj;
                }
                log(`About to rename handout.`);
                ho[0].set({ name: nn });                        // if we get this far, it's safe to rename the handout
            }
            return retObj;
        };

        // available function library, mapping the text supplied to the internal function
        const funcTable = {
            rename: rename,
        };

        let funcregex = new RegExp('^(' + Object.keys(funcTable).join("|") + ')\\(([^)]*)?\\)?');
                // group 1: function from function(arguments)
                // group 2: arguments from function(arguments)
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
            // What to do if no function is included
        }
        return retObj;
    };
    // ------------- ABIL FUNCTION LIBRARY --------------
    const abilFuncs = {
        handout: processHandout,
    };


    // ==================================================
    //		UNAVAILABLE INTERNAL FUNCTIONS
    // ==================================================
    //      these functions are for alternate api calls and are short circuited to arguments
    //      each function should be built using deconstruction assignment, which will provide immediate --arg availability to each parameter
    //      once built, enter it in the library object unavailFuncs to make it available to users

    const viewxray = ({ cid: cid,                                       // character id
                          a: a                                          // attribute
                      } = {}) => { 
        let retObj = { ret: "No return.", safe: true };
        let character = findObjs({ type: 'character', id: cid })[0] || { fail: true };
        if (character.hasOwnProperty("fail")) {
            retObj.ret = msgOutput({ c: "No character sheet found.", t: "ERROR" });
            return retObj;
        }
        let attr = getAttrByName(character.id, a);
        if (!attr) {
            retObj.ret = msgOutput({ c: "Couldn't find that attribute.", t: "ERROR" });
            return retObj;
        }
        retObj.ret = msgOutput({ c: htmlCoding(attr, true), t: "TEXT" });
        return retObj;
    };

    const xray = ({ s: s = "",                                          // repeating section (or pass through for sub procedures)
                    v: v = "c",                                         // attribute value to retrieve (c: current, m: max, n: name)
                    t: t = "",                                          // token id
                    cid: cid = "",                                      // character id
                    cn: cn = "",                                        // character name
                    css: css = "",                                      // free input css for api button
                    bg: bg = "",                                        // background color for api button
                    pos: pos = 0,                                       // position of skill to check
                    cfgObj: cfgObj,                                     // configuration settings
                } = {}) => {
        let retObj = { ret: "No return.", safe: true };

        if (!bg) bg = cfgObj.bg;
        if (!css) css = cfgObj.css;

        let x = /^readxray_(.*?)\((.+?)\)$/.exec(s);
        // group 1: characterid from readxray_characterid(attribute)
        // group 2: attribute from readxray_characterid(attribute)

        if (x) {                                                        // if the first argument is to read the xray, jump over to that function and return what you find
            retObj = viewxray({ cid: x[1], a: x[2] });
            return retObj;
        }
        let character = { fail: true };
        if (cid) {
            character = findObjs({ type: 'character', id: cid })[0] || { fail: true };
        } else if (cn) {
            character = findObjs({ type: 'character' }).filter((chr) => { return chr.get('name') === cn; })[0] || { fail: true };
        } else if (t) {
            character = findObjs({ type: 'character', id: (getObj("graphic", t)).get("represents") })[0] || { fail: true };
        } else {
            log(`Here is S: >${s}<`);
            character = findObjs({ type: 'character', id: s })[0] ||
                findObjs({ type: 'character' }).filter((chr) => { return chr.get('name') === s; })[0] ||
                findObjs({ type: 'character', id: (getObj("graphic", s)).get("represents") })[0] ||
                { fail: true };
                s = "repeating";                                        // we found the character based on s, so we want to start at the top level of that character
        }
        if (character.hasOwnProperty("fail")) {
            retObj.ret = msgOutput({ c: "No character sheet found.", t: "ERROR" });
            return retObj;
        }
        if (s === "repeating") {                                        // if the first argument is to get the repeating sections, jump over to that function and return what you find
            retObj = xrayforrepeating({ cid: character.id, css: css, bg: bg, cfgObj: cfgObj });
            return retObj;
        }
        let sectionRX = new RegExp(`repeating_${s}_([^_]*?)_.*$`);
        // group 1: attributeID from repeating_section_attributeID_suffix
        let attrsinrep = findObjs({ type: 'attribute', characterid: character.id }).filter((r) => { return sectionRX.test(r.get('name')); });
        if (attrsinrep.length < 1) {
            retObj.ret = msgOutput({ c: "No attributes in that section.", t: "ERROR" });
            return retObj;
        }
        let uniquekeys = [...new Set(attrsinrep.map((a) => { return sectionRX.exec(a.get('name'))[1]; }) )];        // extract attributeID (group 1 of the regex), then get an array of unique values
        pos = Number(pos);
        if (isNaN(pos)) {
            retObj.ret = msgOutput({ c: "Argument pos was not recognized as a number.", t: "ERROR" });
            return retObj;
        }
        if (pos >= uniquekeys.length || pos < 0) {
            retObj.ret = msgOutput({ c: `Argument pos out of scope. Min value is 0. Max value for this character is ${uniquekeys.length - 1}.`, t: "ERROR" });
            return retObj;
        }

        let suffixRX = new RegExp(`^repeating_${s}_${uniquekeys[pos]}_(.*)$`);
        // group 1: suffix from repeating_section_attributeID_suffix
        let attrs = findObjs({ type: 'attribute', characterid: character.id }).filter((r) => { return suffixRX.test(r.get('name')); });
        let nameguessRX = new RegExp(`^repeating_${s}_${uniquekeys[pos]}_(.*?name.*)$`);
        // group 1: suffix that contains 'name'
        let attr_nameguess = attrs.filter((r) => { return nameguessRX.test(r.get('name')); }).map((r) => { return nameguessRX.exec(r.get('name'))[1]; })[0] || "";      // filter where the word 'name' is in the suffix, [1] is the group bearing the suffix, [0] is to grab the first attribute that matches

        let retval = "",
            menufor = "",
            menuapi = "",
            attrtable = copystr(msgtable).replace("__bg__", rowbg[0]),
            attrheader = copystr(msg3header).replace("__bg__", rowbg[1]).replace("__cell1__", "SUFFIX").replace("__cell2__","MENU").replace("__cell3__", (attrValTable[v] || attrValTable.c).toUpperCase()),
            rowtemplate = copystr(msg3row),
            attrrows = attrs.reduce((a, val, i) => {
                retval = val.get(attrValTable[v] || attrValTable.c);
                menufor = "";
                menuapi = "";
                if (typeof retval === "string" && retval !== "") {
                    if (execCharSet.includes(retval.charAt(0))) {                   // look for executable statements, if found, we will construct 3 buttons
                        retval = apibutton_xread({ bg: bg, store: val.get('name'), label: "View", charid: character.id, entity: "&#64;", css: css === "" ? "height: 10px; line-height: 10px;" : css }) + " " +
                            apibutton({ bg: bg, store: val.get('name'), label: "Exec", charname: character.get('name'), entity: "&#64;", css: css === "" ? "height: 10px; line-height: 10px;" : css });
                        menuapi = `!insertarg --whisper --show#getrepeating(!!s#${s} !!sfxn#?{Naming attribute|${attr_nameguess}} !!sfxa#${suffixRX.exec(val.get('name'))[1]} !!cid#${character.id} !!op#b  !!bg#${bg} !!css#${css})`;
                        menufor = apibutton_api({ bg: bg, api: menuapi, label: "XRay", charid: character.id, css: css === "" ? "height: 10px; line-height: 10px;" : css });
                    } else {                                                        // just text, so encode it so it doesn't break the output
                        retval = htmlCoding(retval, true);
                    }
                }
                return a + rowtemplate.replace("__bg__", rowbg[(i % 2)]).replace("__cell1__", suffixRX.exec(val.get('name'))[1]).replace("__cell2__",menufor).replace("__cell3__", retval);
            }, attrheader);
        retObj.ret = attrtable.replace("__TABLE-ROWS__", attrrows);
        return retObj;
    };

    const xrayforrepeating = ({ cid: cid = "",                                      // character id
                                css: css = "",                                      // free input css for api button
                                bg: bg = "#ff9747",                                 // background color for api button
                                cfgObj: cfgObj,                                     // configuration settings
    } = {}) => {
        let retObj = { ret: "No return.", safe: true },
            character = { fail: true };
        if (cid) {
            character = findObjs({ type: 'character', id: cid })[0] || { fail: true };
        } else if (cn) {
            character = findObjs({ type: 'character' }).filter((chr) => { return chr.get('name') === cn; })[0] || { fail: true };
        } else if (t) {
            character = findObjs({ type: 'character', id: (getObj("graphic", t)).get("represents") })[0] || { fail: true };
        }
        if (character.hasOwnProperty("fail")) {
            retObj.ret = msgOutput({ c: "No character sheet found.", t: "ERROR" });
            return retObj;
        }

        if (!bg) bg = cfgObj.bg;
        if (!css) css = cfgObj.css;

        let sectionRX = new RegExp(`repeating_([^_]*?)_.*$`);
        // group 1: section from repeating_section_attributeID_suffix
        let sections = findObjs({ type: 'attribute', characterid: character.id }).filter((r) => { return sectionRX.test(r.get('name')); });
        if (sections.length < 1) {
            retObj.ret = msgOutput({ c: "No repeating sections on that sheet.", t: "ERROR" });
            return retObj;
        }
        let uniquekeys = [...new Set(sections.map((a) => { return sectionRX.exec(a.get('name'))[1]; }))];        // extract section (group 1 of the regex), then get an array of unique values

        let retval = "",
            sectiontable = copystr(msgtable).replace("__bg__", rowbg[0]),
            sectionheader = copystr(msg2header).replace("__bg__", rowbg[1]).replace("__cell1__", "GROUP").replace("__cell2__", "XRAY"),
            rowtemplate = copystr(msg2row),
            attrrows = uniquekeys.reduce((a, val, i) => {
                retval = val;
                if (typeof retval === "string" && retval !== "") {
                    let apixray = `!xray --${val} --cid#${character.id} --pos#?{At position...|0} --bg#${bg} --css#${css}`;
                    retval = apibutton_api({ bg: bg, api: apixray, label: "XRay", charid: character.id, css: css === "" ? "height: 10px; line-height: 10px;" : css });
                }
                return a + rowtemplate.replace("__bg__", rowbg[(i % 2)]).replace("__cell1__", val).replace("__cell2__", retval);
            }, sectionheader);
        retObj.ret = sectiontable.replace("__TABLE-ROWS__", attrrows);
        return retObj;
    };

    // ---------- UNAVAILABLE FUNCTION LIBRARY ----------
    const unavailFuncs = {                                           // short-circuited function list as apicatch:func
        xr: xray,
    };

    // ==================================================
    //		HANDLE CHAR NAME CHANGE
    // ==================================================
    // this listens for a character name change, and checks whether there is a configuration file that needs to be managed
    const handleCharNameChange = (character, prev) => {
        log(`===== HANDLE CHAR NAME CHANGE =====`);
        let oldrx = new RegExp(`(iaconfig-)(${escapeRegExp(prev.name.toLowerCase())})`, 'gi');
        // group 1: iaconfig- from iaconfig-prevname
        // group 2: prevName from iaconfig-prevname

        let newrx = new RegExp(`(iaconfig-)(${escapeRegExp(character.get('name').toLowerCase())})`, 'gi');
        // group 1: iaconfig- from iaconfig-characterame
        // group 2: charactername from iaconfig-charactername

        let oldhos = findObjs({ type: "handout" }).filter((h) => { return oldrx.test(h.get('name')) });
        if (oldhos.length===0) return;                              // no config handouts found

        state.insertarg[character.get('name')] = state.insertarg[prev.name] || { cfgObj: Object.assign({}, state.insertarg.global.cfgObj) };
        let cfgObj = state.insertarg[character.get('name')].cfgObj;
        let msg = "",
            btn = "",
            api = "",
            newhos = findObjs({ type: "handout" }).filter((h) => { return newrx.test(h.get('name')) });
        log(`Newhos Length: ${newhos.length}`);
        log(`Oldhos Length: ${oldhos.length}`);
        log(newhos.length + oldhos.length);
        if (newhos.length + oldhos.length > 1) {               // detect conflicts
            msg = `That character has multiple script configurations, either under ${character.get('name')} or under ${prev.name}. You should only keep one, and it should be named IAConfig-${character.get('name')}. Open handouts for comparison?<br>`;
            api = `http://journal.roll20.net/handout/`;
            btn = oldhos.reduce((a, v, i) => { return a + apibutton_api({ bg: cfgObj.bg, api: api + v.id, label: `(${i + 1}) ${v.get('name').replace(/iaconfig-/i, "")}`, css: "min-width: 25px;" + cfgObj.css }) + ' ' }, "");
            btn = newhos.reduce((a, v, i) => { return a + apibutton_api({ bg: cfgObj.bg, api: api + v.id, label: `(${i + 1}) ${v.get('name').replace(/iaconfig-/i, "")}`, css: "min-width: 25px;" + cfgObj.css }) + ' ' }, btn);
            
        } else {                                                // only get here if there is a config for the old name but not the new (ie, no collision)
            let o = oldrx.exec(oldhos[0].get('name'));
            msg = `${character.get('name')} had an InsertArgs script configuration as ${prev.name}. Do you want to rename the config to match the new name?<br>`;
            api = `!insertarg --handout#rename(!!oldid#${oldhos[0].id} !!nn#${o[1] + character.get('name')})`;
            btn = apibutton_api({ bg: cfgObj.bg, api: api, label: "Rename", css: "min-width: 25px;" + cfgObj.css });
        }
        let title = "MANAGE CONFIG FILE";
        msgOutput({ c: msg, t: title, btn: btn, send: true, wto: character.get('name') });
    }

    // ==================================================
    //		HANDLE CONFIG
    // ==================================================
    // listens for handout changes, detects config handouts, and copies those into the state variable for the appropriate speaker
    // calls parseConfig
    const handleConfig = (cfgho) => {
        let horx = /^iaconfig-(.+)$/i;
        //group 1: forName from iaconfig-forName
        let honame = cfgho.get('name');
        if (!horx.test(honame)) return;                                                 // if this isn't a config template, we don't care
        let honamepart = horx.exec(honame)[1].toLowerCase();                            // extract the character name portion, convert to lowercase
        cfgho.get('notes', (notes) => {
            state.insertarg[honamepart] = state.insertarg[honamepart] || {};            // initialize the speaker's object in the state
            state.insertarg[honamepart].cfgObj = state.insertarg.global.cfgObj || {};   // baseline the cfgObj to the global configuration
            Object.assign(state.insertarg[honamepart].cfgObj, parseConfig(notes));      // parseConfig returns an object of properties to apply to the cfgObj

            return;
        });

    };
    const parseConfig = (notes) => {
        let cfgObj = {};
        Object.assign(cfgObj, state.insertarg.global.cfgObj);           // make local copy of the global settings; this will be the starting point for further configurations

        notes = notes.replace(new RegExp(/&amp;|&lt;|&gt;|\\\\/, 'gi'), (e) => { return { "&amp;": "&", "&lt;": "<", "&gt;": ">", "\\": "\\" }[e]; }); // decode specific html entities that the handouts encode
        // get table components into the cfgObj
        let m = /(<!--\sBEGIN\sTABLE\s-->.*?<!--\sEND\sTABLE\s-->).*?(<!--\sBEGIN\sROW\s-->.*?<!--\sEND\sROW\s-->)/gmis.exec(notes);
        // group 1: table delimited by table tags from tablerow
        // group 2: row delimited by row tags from tablerow
        if (m) {
            Object.assign(cfgObj, { table: m[1], row: m[2] });
        }

        // get config components into the cfgObj
        m = /(<!--\sBEGIN\sCONFIG\s-->.*?<!--\sEND\sCONFIG\s-->)/gmis.exec(notes);
        // group 1: config section delimted by config tags
        if (m) {
            let settings = ["css", "bg"],                               // settings available in the config section
                sdata;                                                  // to hold the data from each setting read out of the config
            settings.map((s) => {
                sdata = new RegExp(`^--${s}#(.*?)\r?\n`, 'gmis').exec(m[1]);
                //group 1: user input for the setting from --setting#user input
                if (sdata) {
                    cfgObj[s] = sdata[1];
                }
            });
        }
        return cfgObj;
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg_orig) => {
        if (msg_orig.type !== "api") return;
        let apicatch = "";
        if (/^!xray\s/.test(msg_orig.content)) apicatch = 'xr';
        else if (/^!insertarg(\s|s\s)/.test(msg_orig.content)) apicatch = 'ia';

        if (apicatch === "") return;

        let theSpeaker = getTheSpeaker(msg_orig);

        let args = msg_orig.content.split(/\s--/)
            .slice(1)                                                   // get rid of api handle
            .map(splitArgs)									            // split each arg (foo:bar becomes [foo, bar])
            .map(joinVals);									            // if the value included a colon (the delimiter), join the parts that were inadvertently separated

        const abil = args.shift();                                      // assign the first arg to abil

        // get the player or character's configuration (if present), or the global
        let speakerstate = state.insertarg[theSpeaker.localName.toLowerCase()] || state.insertarg.global,
            cfgObj = {},
            cmdline = "",
            safechat = true,
            rep = {},
            f;
        Object.assign(cfgObj, speakerstate.cfgObj);                     // copy the settings for this run (either from the speaker's state or the global configuration)

        if (apicatch === "ia") {
            if (((abil[0] === "chat" || abil[0] === "whisper") && abil[1] === "") || (abilFuncs.hasOwnProperty(abil[0]))) {
                cmdline = "show";
            } else {
                cmdline = (findObjs({ type: 'ability', characterid: theSpeaker.id, name: abil[1] })[0] || { get: () => { return ""; } }).get("action");
            }
            if (cmdline === "") return;                                 // TO DO - message about not finding the ability

            // CONFIG OBJECT ARGUMENTS
            args.filter((a) => { return Object.keys(cfgObj).includes(a[0].toLowerCase()) && !["table", "row"].includes(a[0].toLowerCase()); })            // deal with only the args recognized as part of the cfgObj, but not table & row
                .map((a) => {
                    cfgObj[a[0].toLowerCase()] = a[1];
                });

            cfgObj.bg = validateHexColor(cfgObj.bg);

            // ABIL FUNCTIONS
            log(`Abil0: ${abil[0]}`);
            log(`Abil1: ${abil[1]}`);
            log(`abilFuncs: ${abilFuncs.hasOwnProperty(abil[0])}`);
            if (abilFuncs.hasOwnProperty(abil[0].toLowerCase())) {                                      // test if abil has an associated function in abilFuncs
                rep = abilFuncs[abil[0]]({                                                              // call the associated function with destructuring assignment on the receiving end
                    args: abil[1],                                                                         // parsing handled on receiving end (minimizes having to enter them individually in 2 places)
                    theSpeaker: theSpeaker,
                    m: msg_orig,
                    cfgObj: cfgObj,
                });
                if (rep.suspend === "true") return;                                                     // should this end further processing // TO DO - is this even needed? could we allow further processing?
                safechat = !rep.safe ? false : safechat;                                                // trip safechat if necessary
            }

            // OTHER ARGUMENTS
            let funcregex = new RegExp('^(' + Object.keys(availFuncs).join("|") + ')\\(([^)]*)?\\)?');
            // group 1: function from function(arguments)
            // group 2: arguments from function(arguments)
            if (args.length < 1) return;                                                                // need at least one replacement hook // TO DO - provide message here "no hooks provided"?
            args.filter((a) => { return !Object.keys(cfgObj).includes(a[0].toLowerCase()); })           // deal with only the custom hooks (not part of cfgObj)
                .map((a) => {
                    f = funcregex.exec(a[1]);
                    if (f) {                                                                            // if we find a function
                        rep = availFuncs[f[1]]({                                                        // pass object to use with destructuring assignment on the receiving end
                            ...(Object.fromEntries((f[2] || "").split("!!")                             // this turns anything provided with a !! prefix into an available parameter for the receiving function
                                .filter((p) => { return p !== ""; })
                                .map(splitArgs)
                                .map(joinVals))),
                            theSpeaker: theSpeaker,
                            m: msg_orig,
                            cfgObj: cfgObj,
                        });
                    } else {
                        rep = { ret: a[1], safe: true };                                                // if no internal function was designated, treat as flat text
                    }
                    safechat = !rep.safe ? false : safechat;                                            // trip safechat if necessary
                    cmdline = cmdline.replace(new RegExp(escapeRegExp(a[0]), 'g'), rep.ret);            // replace all instances of the hook with the replacement text
                    return;
                });

            // TO DO - if the chat can't be set, it should instead be loaded as an api button
            if ((abil[0] === "chat" || abil[0] === "whisper") && safechat) {
                sendChat(abil[0] === "whisper" ? `API` : theSpeaker.chatSpeaker, (abil[0] === "whisper" ? `/w "${theSpeaker.localName}" ` : "") + cmdline);
            }
            else if (theSpeaker.speakerType === "character") {
                let saveAbil = findObjs({ type: 'ability', characterid: theSpeaker.id, name: cfgObj.store })[0] ||
                    createObj("ability", { name: cfgObj.store, action: cmdline, characterid: theSpeaker.id });
                saveAbil.set({ action: cmdline });
                if (abil[0] === "button") {
                    sendChat("API", `/w "${theSpeaker.localName}" ${apibutton({ ...cfgObj, charname: theSpeaker.localName })}`);
                } else {
                    sendChat("API", `/w "${theSpeaker.localName}" ${abil[1]} loaded and ready.`);
                }
            }
        } else {
            rep = unavailFuncs[apicatch]({                                                              // pass object to use with destructuring assignment on the receiving end
                ...(Object.fromEntries(args)),                                                          // this turns anything provided with a -- prefix into an available parameter for the receiving function
                s: abil[0],
                v: abil[1],
                theSpeaker: theSpeaker,
                m: msg_orig,
                cfgObj: cfgObj,
            });

            sendChat("API", `/w "${theSpeaker.localName}" ${rep.ret}`);
        }

    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on("change:handout", handleConfig);
        on("change:character:name", handleCharNameChange)
    };

    return {
        VersionInfo: versionInfo,
        LogSig: logsig,
        RegisterEventHandlers: registerEventHandlers,
        ParseConfig: parseConfig,
        HandleConfig: handleConfig,
        DefaultCfgObj: { table: menutable, row: menurow, bg: bgcolor, css: "" },
    };

})();

on('ready', () => {
    insertarg.VersionInfo();
    insertarg.LogSig();
    insertarg.RegisterEventHandlers();

    state.insertarg = {};
    state.insertarg.global = {};
    state.insertarg.global.cfgObj = insertarg.DefaultCfgObj;                                        // explicitly write the defaults, because if there is a global config it will overwrite in a moment
    let cfgglobal = findObjs({ type: "handout" }).filter((h) => { return /^iaconfig-global$/gi.test(h.get('name')) })[0] || { fail: true, get: () => { return ""; } };
    cfgglobal.get('notes', (notes) => {
        if (notes) Object.assign(state.insertarg.global.cfgObj, insertarg.ParseConfig(notes));      // by this time, we've asynchronously obtained the notes, so pass them to the parsing function and assign the result to the state
        let cfghandouts = findObjs({ type: "handout" })                                             // now that the global configuration is in state, process the rest of the config handouts
            .filter((h) => { return /^iaconfig-(.+)$/gi.test(h.get('name')); })                     // get only the handouts
            .filter((h) => { return !/^iaconfig-global$/gi.test(h.get('name')) });                  // filter to remove the global
        _.each(cfghandouts, insertarg.HandleConfig);
    });
});
