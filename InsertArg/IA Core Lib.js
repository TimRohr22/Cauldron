/*
=========================================================
Name			:	InsertArg Core Lib (ialibcore)
Version			:	1.2
Last Update		:	8/25/2020
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/InsertArg
Roll20 Contact	:	timmaugh
=========================================================

*/

const ialibcore = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const vrs = '1.2';
    const versionInfo = () => {
        const vd = new Date(1598616529504);
        log('\u0166\u0166 InsertArg Core Lib v' + vrs + ', ' + vd.getFullYear() + '/' + (vd.getMonth() + 1) + '/' + vd.getDate() + ' \u0166\u0166');
        return;
    };
    const getVrs = () => { return vrs; };

    // ==================================================
    //		UTILITIES
    // ==================================================
    const deepCopy = (inObject) => {                                            // preserve complex arrays/objects
        let outObject, value, key;
        if (typeof inObject !== "object" || inObject === null) {
            return inObject // Return the value if inObject is not an object
        }
        // Create an array or object to hold the values
        outObject = Array.isArray(inObject) ? [] : {}

        for (key in inObject) {
            value = inObject[key]
            // Recursively (deep) copy for nested objects, including arrays
            outObject[key] = deepCopy(value)
        }
        return outObject
    };
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const execCharSet = ["&", "!", "@", "#", "%", "?"];
    const btnElem = { attr: '&#64;', abil: '&#37;', macro: '&#35;' }
    const checkTicks = (s) => {
        let special = {
            "`br`": "<br>",
            "`hr`": "<hr>"
        }

        if (typeof s !== 'string') return s;
        return special[s] || (s.indexOf("`") === 0 && s.charAt(s.length - 1) === "`" ? s.slice(1, s.length - 1) : s);

    };

    // ==================================================
    //		LIBRARY FUNCTIONS
    // ==================================================
    const puttext = ({
        m: m,                                                           // message object (included only because it is being passed and we don't want to output it with the rest)
        theSpeaker: theSpeaker,                                         // speaker object (included only because it is being passed and we don't want to output it with the rest)
        cfgObj: cfgObj,                                                 // config object (included only because it is being passed and we don't want to output it with the rest)
        ...t                                                            // everything else the user passes will go here
    }) => {
        let retObj = { ret: "", safe: true };
        retObj.ret += Object.keys(t).reduce((a, v) => a + checkTicks(t[v]), "");
        return retObj;
    };
    const getattr = ({
        a: a,                                       // attribute id or (character)|(attribute)
        v: v = "current",                           // value wanted (current or max)
        h: h = 'false',                             // whether to encode html characters
        theSpeaker: theSpeaker                      // speaker object
    }) => {
        let retObj = { ret: "", safe: true };
        ['m', 'max'].includes(v) ? v = 'max' : v = 'current';
        let attr = ia.AttrFromAmbig(a, theSpeaker.id);
        if (!attr) {
            ia.MsgBox({ c: `getattr: No attribute found for ${a}.`, t: 'NO ATTRIBUTE', send: true, wto: theSpeaker.localName });
            return retObj;
        }
        retObj.ret = ['t', 'true', 'y', 'yes'].includes(h) ? ia.HTMLCoding(attr.get(v)) : attr.get(v);
        return retObj;
    };
    const getabil = ({
        a: a,                                       // ability id, or (character)|(ability)
        h: h = 'false',                             // whether to encode html characters
        theSpeaker: theSpeaker                      // speaker object
    }) => {
        let retObj = { ret: "", safe: true };
        let abil = ia.AbilFromAmbig(a, theSpeaker.id);
        if (!abil) {
            ia.MsgBox({ c: `getabil: No ability found for ${a}.`, t: 'NO ABILITY', send: true, wto: theSpeaker.localName });
            return retObj;
        }
        retObj.ret = ['t', 'true', 'y', 'yes'].includes(h) ? ia.HTMLCoding(abil.get('action')) : abil.get('action');
        return retObj;
    };
    const getmacro = ({
        a: a,                                       // macro id or name
        h: h = 'false',                             // whether to encode html characters
        theSpeaker: theSpeaker                      // speaker object
    }) => {
        let retObj = { ret: "", safe: true };
        let mac = ia.macroFromAmbig(a, theSpeaker);
        if (!mac) {
            ia.MsgBox({ c: `getmacro: No macro found for ${a}.`, t: 'NO MACRO', send: true, wto: theSpeaker.localName });
            return retObj;
        }
        retObj.ret = ['t', 'true', 'y', 'yes'].includes(h) ? ia.HTMLCoding(mac.get('action')) : mac.get('action');
        return retObj;
    };
    const getme = ({
        r: r = 'id',                                // what to return (id or name)
        frmt: frmt = '',                            // formatting options
        theSpeaker: theSpeaker                      // speaker object
    }) => {
        if (['n', 'name'].includes(r)) r = 'localName';
        else if (['c', 'cs'].includes(r)) r = 'chatSpeaker';
        else r = 'id';
        let formattedme = ia.ApplyFormatOptions(frmt, [{ name: theSpeaker[r] }], 'name')[0].name;
        return { ret: formattedme, safe: true };
    };
    const puttargets = ({
        n: n = 1,                                       // number of targets
        l: l = "Target",                                // label for each targeting iteration
        r: r = "token_id",                              // what to return in the targeting call
        d: d = " "                                      // delimiter (default is space)
    }) => {
        d = checkTicks(d);                              // check for opening/closing tick marks
        let ret = (Array(Number(n)).fill(0)
            .reduce((a, v, i) => {
                let iter = n > 1 ? ` ${i + 1}` : ``;
                return a + `@{target|${l}${iter}|${r}}${d}`;
            }, ""))
            .replace(new RegExp(`${escapeRegExp(d)}$`), '');
        return { ret: ret, safe: false };
    };
    const getselected = ({
        m: m,                                           // msg object
        d: d = " "                                      // delimiter (default is space)
    }) => {
        d = checkTicks(d);                              // check for opening/closing tick marks
        let r = "";
        if (m.selected) r = m.selected.reduce((a, v) => a + v._id + d, "").replace(new RegExp(`${d}$`), '');
        return { ret: r, safe: true };
    };
    const getsections = ({
        c: c,                                           // character (id, name, or token)
        d: d = " ",                                     // delimiter (default is space)
        theSpeaker: theSpeaker,                         // speaker object
        f: f = "",                                      // filters
        frmt: frmt = ''                                 // formatting options
    }) => {
        let retObj = { ret: "", safe: true };
        d = checkTicks(d);                              // check for opening/closing tick marks
        let character = ia.CharFromAmbig(c);
        if (!character) {
            ia.MsgBox({ c: `getsections: No character found for ${c}.`, t: 'NO CHARACTER', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        let sectionRX = new RegExp(`repeating_([^_]*?)_.*$`);
        // group 1: section from repeating_section_attributeID_suffix
        let sections = findObjs({ type: 'attribute', characterid: character.id }).filter(r => sectionRX.test(r.get('name')));
        if (sections.length < 1) {
            retObj.ret = msgOutput({ c: `getsections: No repeating sections on the sheet for ${c}.`, t: "NO REPEATING SECTIONS", send: true, wto: theSpeaker.localName });
            return retObj;
        }

        let uniquekeys = [...new Set(sections.map(a => sectionRX.exec(a.get('name'))[1]))];        // extract section (group 1 of the regex), then get an array of unique values

        uniquekeys = uniquekeys.map(k => { return { key: k }; });

        // ---------------- FILTER CONDITIONS ----------------
        if (f) uniquekeys = ia.ApplyFilterOptions(f, uniquekeys, 'key');                          // apply filter conditions
        // -------------- END FILTER CONDITIONS --------------

        // --------------- FORMATTING OPTIONS ----------------
        uniquekeys = ia.ApplyFormatOptions(frmt, uniquekeys, 'label');
        // ------------- END FORMATTING OPTIONS --------------

        retObj.ret = uniquekeys.map(k => k.key).join(d);
        return retObj;
    };
    const getrepeating = ({
        s: s = "",                                      // repeating section
        sfxn: sfxn = "",                                // suffix denoting name attribute for a given entry in a repeating section
        sfxa: sfxa = "",                                // suffix denoting action attribute for a given entry in a repeating section
        sfxrlbl: sfxrlbl = '',                          // suffix denoting the roll label when used with elem output
        c: c,                                           // character (id, name, or token)
        d: d = " ",                                     // delimiter (default is space)
        op: op = "l",                                   // how to output (b: button, q: query, n: nested query, a: label list (action name), v: value list (action value), [default]/[none]: label list (naming attribute value)
        p: p = "Select",                                // query prompt
        v: v = "c",                                     // attribute value to retrieve (c: current, m: max)
        bg: bg,                                         // background color for api button
        theSpeaker: theSpeaker,                         // speaker object
        css: css = "",                                  // free input css for api button
        f: f = "",                                      // filter conditions
        ef: ef = "",                                    // filter conditions (executable)
        frmt: frmt = "",                                // pipe-delimited list of formatting options
        efrmt: efrmt = "",                              // pipe-delimited list of formatting options for executing text (use carefully!)
        rlbl: rlbl = '',                                // label for a repeating button set (for iterative output)
        cfgObj: cfgObj                                  // configuration settings
    }) => {
        let retObj = { ret: "", safe: true };
        let character = ia.CharFromAmbig(c);
        d = checkTicks(d);                              // check for opening/closing tick marks
        if (!character) {
            ia.MsgBox({ c: `getrepeating: No character found for ${c}.`, t: 'NO CHARACTER', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        let nameRX = new RegExp(`^repeating_${s}_(?:[^_]*?)_(.+)$`, 'g');
        // group 1: suffix from repeating_section_repID_suffix

        if (s && !sfxn) {                                                               // if we have a section and a character but no sfxn, see if we can identify one
            let attrsfx = findObjs({ type: 'attribute', characterid: character.id })    // get all attributes for this character
                .filter(r => nameRX.test(r.get('name')))                                // filter for the section
                .map(r => {
                    nameRX.lastIndex = 0;
                    return nameRX.exec(r.get('name'))[1];                               // isolate the suffix portion of the name of each attribute
                })
                .filter(r => /name/g.test(r));                                          // filter where that suffix contains 'name'
            if (attrsfx.length) sfxn = attrsfx[0];                                      // if we found anything, assign sfxn to it
        }
        if (!(sfxa && s && sfxn)) {                                                     // before we go any further, we have to have a section, naming suffix, and action suffix
            ia.MsgBox({ c: `getrepeating: You must supply values for section (s), the returned action suffix (sfxa), and the naming suffix (sfxn) if one cannot be identified.`, t: 'MISSING PARAMETERS', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        bg = bg ? bg : cfgObj.bg;
        css = `${cfgObj.css}${css}`;
        rlbl = checkTicks(rlbl);

        ['m', 'max'].includes(v) ? v = 'max' : v = 'current';

        let repRX = new RegExp(`^repeating_${s}_([^_]*?)_${sfxn}$`, 'g');
        // group 1: repID from repeating_section_repID_suffix
        let list = findObjs({ type: 'attribute', characterid: character.id })           // this will hold an array of objects in the form of {nameObj, execObj, label, execName, execText, rlbl}
            .filter(r => repRX.test(r.get('name')))
            .map(a => {
                let repid = repRX.exec(a.get('name'))[1];
                let locrlbl = '';
                repRX.lastIndex = 0;
                // get the attribute object for the action/exec attribute
                let aObj = findObjs({ type: 'attribute', characterid: character.id }).filter(ao => ao.get('name') === `repeating_${s}_${repid}_${sfxa}`)[0] || { id: '', get: () => { return 'not found'; } };
                // get the attribute object for the sfxrlbl, if one is provided
                if (!rlbl) {
                    if (sfxrlbl) {
                        locrlbl = (findObjs({ type: 'attribute', characterid: character.id }).filter(a => new RegExp(`^repeating_${s}_${repid}_${sfxrlbl}$`).test(a.get('name')))[0] || { get: () => { return 'Roll' } }).get('current');
                    } else locrlbl = 'Roll';
                } else locrlbl = rlbl;
                return { nameObj: a, execObj: aObj, label: a.get('current'), execName: aObj.get('name'), execText: aObj.get(v), rlbl: locrlbl || 'Roll' };
            });
        // we should now have an array of objects of the form {nameObj, execObj, label, execName, execText, rlbl}
        // test to make sure there was actually an attribute for sfxn & sfxa
        if (!list.length) {
            ia.MsgBox({ c: `getrepeating: No attributes found with that naming suffix (sfxn).`, t: 'NO ATTRIBUTE', send: true, wto: theSpeaker.localName });
            return retObj;
        } else if (!list.filter(a => a.execObj.id).length) {
            ia.MsgBox({ c: `getrepeating: No attributes found with that action suffix (sfxa).`, t: 'NO ATTRIBUTE', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        // ---------------- FILTER CONDITIONS ----------------
        list = ia.ApplyFilterOptions(f, list, 'label');                          // apply filter conditions
        list = ia.ApplyFilterOptions(ef, list, 'execText');
        // -------------- END FILTER CONDITIONS --------------

        // --------------- FORMATTING OPTIONS ----------------
        list = ia.ApplyFormatOptions(frmt, list, 'label');
        list = ia.ApplyFormatOptions(efrmt, list, 'execText');
        // ------------- END FORMATTING OPTIONS --------------

        if (!list.length) {                                 // no entries means there were no attributes found from any of the options
            ia.MsgBox({ c: `getrepeating: No attributes found for ${c} with the given filters.`, t: 'NO ATTRIBUTE', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        op = op.length ? op : 'l';                          // make sure there is at least 1 character in op
        let templist = deepCopy(list);                      // preserve the list while the retObj is written
        retObj = ia.BuildOutputOptions({ p: p, op: op, list: list, bg: bg, css: css, character: character, elem: 'attr', v: v, theSpeaker: theSpeaker, d: d });
        retObj.objarray = templist;                         // in case another function needs the array of objects

        return retObj;
    };
    const getattrs = ({
        c: c = "",                                      // character (id, name, or token)
        v: v = "current",                               // value wanted (current or max)
        l: l = "",                                      // list of attribute ids and/or names
        d: d = " ",                                     // delimiter (default: space)
        op: op = "l",                                   // how to output (b: button, q: query, n: nested query, v: attribute values, l: attribute labels (names), [default]/[none]: l)
        p: p = "Select",                                // query prompt
        bg: bg,                                         // background color for api button
        theSpeaker: theSpeaker,                         // speaker object
        css: css = "",                                  // free input css for api button
        f: f = "",                                      // filter conditions (label)
        ef: ef = "",                                    // filter conditions (executable)
        frmt: frmt = "",                                // pipe-delimited list of formatting options
        efrmt: efrmt = "",                               // pipe-delimited list of formatting options for executing text (use carefully!)
        rlbl: rlbl = 'Roll',                            // label for a repeating button set (for iterative output)
        cfgObj: cfgObj                                  // configuration settings
    }) => {
        let retObj = { ret: "", safe: true };
        let attr;
        d = checkTicks(d);                              // check for opening/closing tick marks
        ['m', 'max'].includes(v) ? v = 'max' : v = 'current';
        if (!c) {
            ia.MsgBox({ c: `getattrs: You must supply a character (c) which could be a character name, id, or token id (if the token represents a character).`, t: 'NO CHARACTER', send: true, wto: theSpeaker.localName });
            return retObj;
        }
        let character = ia.CharFromAmbig(c);
        if (!character) {
            ia.MsgBox({ c: `getattrs: No character found for ${c}.`, t: 'NO CHARACTER', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        bg = bg ? bg : cfgObj.bg;
        css = `${cfgObj.css}${css}`;
        rlbl = checkTicks(rlbl);
        if (!rlbl) rlbl = 'Roll';
        let list = [];                                                                      // this will hold an array of objects in the form of {nameObj, execObj, label, execName, execText, rlbl}
        let ldelim = "", largs = [];
        if (!l) {                                                                           // no list provided, so get all non-repeating attributes
            list = findObjs({ type: 'attribute', characterid: character.id })
                .filter(a => !a.get('name').startsWith('repeating_'))
                .map(a => { return { nameObj: a, execObj: a, label: a.get('name'), execName: a.get('name'), execText: a.get(v), rlbl: rlbl }; });
        } else {                                                                            // list provided
            if (l.indexOf("|") > -1) {                                                      // there are multiple items
                let rxresult = /^(.*?)\|([^|].*$)/.exec(l);
                // group 1: every thing before the last of the first set of appearing pipes
                // group 2: the remaining list after the same pipe
                ldelim = rxresult[1];                                                       // characters before first pipe are the internal delimiter
                largs = rxresult[2].split(ldelim);                                          // list after the first pipe is rejoined on pipes, then split on the delimiter

                if (!ldelim || !largs.length) {
                    ia.MsgBox({ c: `getattrs: A delimiter must precede a valid list (l).`, t: 'NO DELIMITER OR NO LIST', send: true, wto: theSpeaker.localName });
                    return retObj;
                }
            } else {                                                                        // no pipe means single entry, so everything goes into largs
                largs.push(l);
            }
            list = largs.map(a => a.split(" "))                                             // if there is a space, we have a label, too
                .map(a => { return { nameObj: ia.AttrFromAmbig(a[0], character.id), label: a.slice(1).join(" ") || "" }; })   // join everything after the first space, return an object in the form of {nameObj, label}
                .filter(a => a.nameObj)                                                     // filter for where we didn't find an object
                .map(a => { return { nameObj: a.nameObj, execObj: a.nameObj, label: a.label || a.nameObj.get('name'), execName: a.nameObj.get('name'), execText: a.nameObj.get(v), rlbl: rlbl }; });    // expand each entry into all of the properties we need
        }

        // ---------------- FILTER CONDITIONS ----------------
        list = ia.ApplyFilterOptions(f, list);
        list = ia.ApplyFilterOptions(ef, list, 'execText');
        // -------------- END FILTER CONDITIONS --------------

        // --------------- FORMATTING OPTIONS ----------------
        list = ia.ApplyFormatOptions(frmt, list);
        list = ia.ApplyFormatOptions(efrmt, list, 'execText');
        // ------------- END FORMATTING OPTIONS --------------

        if (!list.length) {                                 // no entries means there were no attributes found from any of the options
            ia.MsgBox({ c: `getattrs: No attribute found for ${c} with the given parameters.`, t: 'NO ATTRIBUTE', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        op = op.length ? op : 'l';                          // make sure there is at least 1 character in op
        let templist = deepCopy(list);                      // preserve the list while the retObj is written
        retObj = ia.BuildOutputOptions({ p: p, op: op, list: list, bg: bg, css: css, character: character, elem: 'attr', v: v, theSpeaker: theSpeaker, d: d });
        retObj.objarray = templist;                         // in case another function needs the array of objects
        return retObj;

    };
    const getabils = ({
        c: c = "",                                      // character (id, name, or token)
        l: l = "",                                      // list of abilities ids and/or names
        d: d = " ",                                     // delimiter (default: space)
        op: op = "l",                                   // how to output (b: button, q: query, n: nested query, a: action name, x: action value, [default]/[none]: delimited list)
        p: p = "Select",                                // query prompt
        bg: bg,                                         // background color for api button
        theSpeaker: theSpeaker,                         // speaker object
        css: css = "",                                  // free input css for api button
        f: f = "",                                      // filter conditions
        ef: ef = "",                                    // filter conditions (executable)
        frmt: frmt = "",                                // pipe-delimited list of formatting options
        efrmt: efrmt = "",                               // pipe-delimited list of formatting options for executing text (use carefully!)
        rlbl: rlbl = 'Roll',                            // label for a repeating button set (for iterative output)
        cfgObj: cfgObj                                  // configuration settings
    }) => {
        let retObj = { ret: "", safe: true };
        let abil;
        d = checkTicks(d);                              // check for opening/closing tick marks
        if (!c) {
            ia.MsgBox({ c: `getabilities: You must supply a character (c) which could be a character name, id, or token id (if the token represents a character).`, t: 'NO CHARACTER', send: true, wto: theSpeaker.localName });
            return retObj;
        }
        let character = ia.CharFromAmbig(c);
        if (!character) {
            ia.MsgBox({ c: `getabilities: No character found for ${c}.`, t: 'NO CHARACTER', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        bg = bg ? bg : cfgObj.bg;
        css = `${cfgObj.css}${css}`;
        rlbl = checkTicks(rlbl);
        if (!rlbl) rlbl = 'Roll';

        let list = [];                                                                      // this will hold an array of objects in the form of {nameObj, execObj, label, execName, execText, rlbl}
        let v = 'action';
        let ldelim = "", largs = [];
        if (!l) {                                                                           // no list provided, so get all abilities
            list = findObjs({ type: 'ability', characterid: character.id })
                .map(a => { return { nameObj: a, execObj: a, label: a.get('name'), execName: a.get('name'), execText: a.get(v), rlbl: rlbl }; });
        } else {                                                                            // list provided
            if (l.indexOf("|") > -1) {                                                      // there are multiple items
                let rxresult = /^(.+?)\|([^|].*$)/.exec(l);
                // group 1: every thing before the last of the first set of appearing pipes
                // group 2: the remaining list after the same pipe
                ldelim = rxresult[1];                                                       // characters before first pipe are the internal delimiter
                largs = rxresult[2].split(ldelim);                                          // list after the first pipe is rejoined on pipes, then split on the delimiter

                if (!ldelim || !largs.length) {
                    ia.MsgBox({ c: `getabilities: A delimiter must precede a valid list (l).`, t: 'NO DELIMITER OR NO LIST', send: true, wto: theSpeaker.localName });
                    return retObj;
                }
            } else {                                                                        // no pipe means single entry, so everything goes into largs
                largs.push(l);
            }
            list = largs.map(a => a.split(" "))                                             // if there is a space, we have a label, too
                .map(a => { return { nameObj: ia.AttrFromAmbig(a[0], character.id), label: a.slice(1).join(" ") }; })   // join everything after the first space, return an object in the form of {nameObj, label}
                .filter(a => a.nameObj)                                                     // filter for where we didn't find an object
                .map(a => { return { nameObj: a.nameObj, execObj: a.nameObj, label: a.label || a.get('name'), execName: a.nameObj.get('name'), execText: a.nameObj.get(v), rlbl: rlbl }; });    // expand each entry into all of the properties we need
        }
        // ---------------- FILTER CONDITIONS ----------------
        list = ia.ApplyFilterOptions(f, list);
        list = ia.ApplyFilterOptions(ef, list, 'execText');
        // -------------- END FILTER CONDITIONS --------------

        // --------------- FORMATTING OPTIONS ----------------
        list = ia.ApplyFormatOptions(frmt, list);
        list = ia.ApplyFormatOptions(efrmt, list, 'execText');
        // ------------- END FORMATTING OPTIONS --------------

        if (!list.length) {                                 // no entries means there were no abilities found from any of the options
            ia.MsgBox({ c: `getabilities: No ability found for ${character.get('name')} with the given parameters.`, t: 'NO ABILITY', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        op = op.length ? op : 'l';                          // make sure there is at least 1 character in op
        let templist = deepCopy(list);                      // preserve the list while the retObj is written
        retObj = ia.BuildOutputOptions({ p: p, op: op, list: list, bg: bg, css: css, character: character, elem: 'abil', v: v, theSpeaker: theSpeaker, d: d });
        retObj.objarray = templist;                         // in case another function needs the array of objects
        return retObj;
    };
    const gettokens = ({
        l: l = '',                                                      // list of tokens to retrieve
        v: v = 'id',                                                    // value to return (id, cid, name)
        pg: pg = '',                                                    // page id to draw tokens from
        rep: rep = 'false',                                             // whether the tokens should be limited to only those represent characters
        lyr: lyr = 'objects',                                           // pipe separated list for layer for tokens, default: token
        d: d = ' ',                                                     // delimiter (default: space)
        p: p = 'Select',                                                // prompt for query output
        op: op = "l",                                                   // how to output the retrieved tokens
        f: f = '',                                                      // filter options
        frmt: frmt = '',                                                // format options
        rlbl: rlbl,
        bg: bg = '',
        css: css = '',
        m: m,                                                           // message object
        theSpeaker: theSpeaker,                                         // the speaker object
        cfgObj: cfgObj                                                  // config object
    }) => {
        let retObj = { ret: "", safe: true };
        d = checkTicks(d);                                              // check for opening/closing tick marks
        bg = bg ? bg : cfgObj.bg;
        css = `${cfgObj.css}${css}`;
        rep = ['true', 't', 'yes', 'y', true].includes(rep) ? true : false;
        if (!pg) pg = Campaign().get("playerpageid");
        lyr = lyr.split("|");
        if (lyr.includes('gmlayer') && !playerIsGM(m.playerid)) {
            ia.MsgBox({ c: `gettokens: GMLayer is only accessible by GMs.`, t: 'ACCESS RESTRICTED', send: true, wto: theSpeaker.localName });
            return retObj;
        }
        let list = [];                                                                      // this will hold an array of objects in the form of {nameObj, execObj, label, execName, execText, rlbl}
        v = ['n', 'name'].includes(v) ? 'name' : 'id';
        let ldelim = "", largs = [];
        if (!l) {                                                                           // no list provided, so get all tokens
            list = findObjs({ type: 'graphic', subtype: 'token' })
                .map(t => { return { nameObj: t, execObj: t.get('represents') ? ia.CharFromAmbig(t.get('represents')) : undefined }; })
                .map(t => {                                                                 // expand each entry into all of the properties we need
                    return {
                        nameObj: t.nameObj,
                        execObj: t.execObj,
                        label: t.nameObj.get('name'),
                        execName: t.execObj ? t.execObj.get('name') : "",
                        execText: t.nameObj.id,
                        rlbl: rlbl
                    };
                });

        } else {                                                                            // list provided
            if (l.indexOf("|") > -1) {                                                      // there are multiple items
                let rxresult = /^(.+?)\|([^|].*$)/.exec(l);
                // group 1: every thing before the last of the first set of appearing pipes
                // group 2: the remaining list after the same pipe
                ldelim = rxresult[1];                                                       // characters before first pipe are the internal delimiter
                largs = rxresult[2].split(ldelim);                                          // list after the first pipe is rejoined on pipes, then split on the delimiter

                if (!ldelim || !largs.length) {
                    ia.MsgBox({ c: `gettokens: A delimiter must precede a valid list (l).`, t: 'NO DELIMITER OR NO LIST', send: true, wto: theSpeaker.localName });
                    return retObj;
                }
            } else {                                                                        // no pipe means single entry, so everything goes into largs
                largs.push(l);
            }
            list = largs.map(a => a.split(" "))                                             // if there is a space, we have a label, too
                .map(t => { return { nameObj: ia.TokenFromAmbig(t[0]), label: t.slice(1).join(" ") }; })   // join everything after the first space, return an object in the form of {nameObj, label}
                .filter(t => t.nameObj)                                                     // filter for where we didn't find an object
                .map(t => {                                                                 // expand each entry into all of the properties we need
                    return {
                        nameObj: t.nameObj,
                        execObj: t.get('represents') ? ia.CharFromAmbig(t.get('represents')) : undefined,
                        label: t.label || t.get('name'),
                        execName: t.get('represents') ? getObj('character', t.get('represents')).get('name') : '',
                        execText: t.id,
                        rlbl: rlbl
                    };
                })
                .filter(t => t.nameObj.get('pageid') === pg && t.nameObj.get('layer') === lyr);       // filter for page & map
        }
        log([...new Set(list.map(a => a.nameObj.get('layer')))].join(", "));
        list = list.filter(t => t.nameObj.get('pageid') === pg)                             // fitler for page
            .filter(t => lyr.includes(t.nameObj.get('layer')));                             // filter for layer
        list = rep ? list.filter(t => t.execObj) : list;                                    // filter for representing a character, if rep is true

        // ---------------- FILTER CONDITIONS ----------------
        list = ia.ApplyFilterOptions(f, list, 'execText');
        // -------------- END FILTER CONDITIONS --------------

        // --------------- FORMATTING OPTIONS ----------------
        list = ia.ApplyFormatOptions(frmt, list, 'execText');
        // ------------- END FORMATTING OPTIONS --------------

        if (!list.length) {                                 // no entries means there were no abilities found from any of the options
            ia.MsgBox({ c: `gettokens: No tokens found for the given parameters.`, t: 'NO TOKENS', send: true, wto: theSpeaker.localName });
            return retObj;
        }

        op = op.length ? op : 'l';                          // make sure there is at least 1 character in op
        let templist = deepCopy(list);                      // preserve the list while the retObj is written
        retObj = ia.BuildOutputOptions({ p: p, op: op, list: list, bg: bg, css: css, elem: 'abil', v: v, theSpeaker: theSpeaker, d: d });
        retObj.objarray = templist;                         // in case another function needs the array of objects
        return retObj;
    };


    // ==================================================
    //      HELP OBJECT
    // ==================================================
    const formatHelp = ['frmt', `gethelp(format${ia.GetHelpArg()})`];
    const filterHelp = ['f', `gethelp(filter${ia.GetHelpArg()})`];
    const delimHelp = ['d', 'delimiter between each output value; enclose with tick marks to include leading/trailing space; default: (space)'];
    const outputHelp = ['op', `gethelp(output${ia.GetHelpArg()})`];

    const help = {
        [`output${ia.GetHelpArg()}`]: {
            msg: 'Use output (op) options for how to return the retrieved items. Default option is \'l\' (list).',
            args: [
                ['b', 'buttons<br>repeating elements structured as (label: sfxn, action: sfxa); standard attributes (label: name, action: current or max)<br>abilities (label: name, action: action)'],
                ['be', 'as \'b\', except intended for individual elem rows for menu with external labels; utilizes the rlbl property for the button label'],
                ['br', 'buttons to read the contents of the attribute in chat'],
                ['bre/ber', 'as \'br\', except intended for individual elem rows for menu with external labels; utilizes the rlbl property for the button labels'],
                ['q', 'query producing (label,return) pairs; uses prompt argument (p) for query interrogative; can be refined with further letters as follows; defaults to \'qlv\''],
                ['ql', 'query producing (label) list; uses prompt argument (p) for query interrogative<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;repeating (label: sfxn)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;standard attributes (label: name)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;abilities (label: name)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;tokens (label: name)'],
                ['qv', 'query producing (return) list; uses prompt argument (p) for query interrogative<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;repeating (return: sfxa)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;standard attributes (return: current or max)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;abilities (return: action)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;tokens (return: id)'],
                ['qln', 'query producing (label,return) pairs; uses prompt argument (p) for query interrogative<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;repeating (label: sfxn, return: sfxa name)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;standard attributes (label: name, return: name)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;abilities (label: name, return: name)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;tokens (label: name, return: character name)'],
                ['qlv', '(alias of q); query producing (label,return) pairs; uses prompt argument (p) for query interrogative<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;repeating (label: sfxn, return: sfxa value)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;standard attributes (label: name, return: current or max)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;abilities (label: name, return: action)<br>\
                        &nbsp;&nbsp;&nbsp;&nbsp;tokens (label: name, return: id)'],
                ['n', 'as query (including all secondary options), except with nested output (html entity replacement as per nest function)'],
                ['l', 'list of names of the sheet objects\' name elements<br>repeating: sfxn sub sttribute name<br>standard attributes: name<br>abilities: name'],
                ['a', 'list of names of the sheet objects\' action elements (differs from \'l\' only for repeating sections<br>repeating: sfxa sub sttribute name<br>standard attributes: name<br>abilities: name'],
                ['v', 'list of values for the sheet objects\' action elements<br>repeating: sfxa sub sttribute current or max<br>standard attributes: current or max<br>abilities: action'],
                ['lve', 'a list/value output arranged for spreading across elem rows of a table']
            ]
        },
        [`format${ia.GetHelpArg()}`]: {
            msg: 'Use formatting options to structure or modify either your label (frmt) or your returned executable value (efrmt). Formatting options are passed using the \'frmt\' and \'efrmt\' parameters, if the internal function accepts them; multiple formatting options can be passed as a pipe-separated list where each element is constructed as:<br>(format)[#(option)]<br><br>\
                        Formatting options are applied in left to right order to each returned value. The following frmt parameter would first insert drop everything to lowercase, then do a replace operation to remove text, then format the result as title case:<br>!!frmt#lc|fr#roll_formula#``|tc',
            args: [
                ['lc', 'lowercase'],
                ['uc', 'uppercase'],
                ['tc', 'titlecase'],
                ['su', 'insert space before uppercase letters'],
                ['_s', 'change underscore to space'],
                ['o+', 'sort ascending'],
                ['o-', 'sort descending'],
                ['^t', 'insert before value; requires a &#35; (pound/hash) and then the text to insert'],
                ['t^', 'insert after value; requires a &#35; (pound/hash) and then the text to insert'],
                ['fr', 'find and replace; requires a &#35; followed by the search text followed by &#35; and then the replacemnet text; enclose strings with leading/trailing spaces in tick marks (`)'],
                ['rslv', 'special find/replace that encloses the find text in &#64;{} before replacing it; helpful with resolution of roll template parts that might otherwise break'],
                ['n', 'format the text for nested output, replacing the three characters: } , | with their html entities only where they are not involved in an attribute or ability lookup']
            ]
        },
        [`filter${ia.GetHelpArg()}`]: {
            msg: 'Enter filters for the returned values to restrict the returned items according to your specifications. Filters are passed using the \'f\' parameter to filter on the name or label of the object, or using the \'ef\' parameter to filter on the executable (action) text; multiple filters can be passed as a pipe-separated list where each element is constructed as:<br>(filter type)#(test condition)<br>\
                        ...and the filter type is drawn from the following list...',
            args: [
                ['x', 'executable; tests the first character for the presence of an executing character:<br>&#64;&nbsp;&nbsp;&#37;&nbsp;&nbsp;&#63;&nbsp;&nbsp;&amp;&nbsp;&nbsp;&#33;'],
                ['^f', 'begins with'],
                ['f^', 'ends with'],
                ['^f^', 'contains'],
                ['-^f', 'does not begin with'],
                ['-f^', 'does not end with'],
                ['-^f^', 'does not contain'],
                ['top', 'limit returns to top x returns, where x is a number; negative numbers represent bottom x returns'],
                ['s', 'token status markers includes'],
                ['-s', 'token status markers do not include']
            ]
        },
        puttext: {
            msg: 'Places any number of elements in the command line, in order, at the given hook. \
                        Elements can be simple text or internal functions. Use this when you need to use \
                        an internal function AFTER including other text and/or to establish the presence of hooks \
                        for future replacement operations. Text that begins or ends with a space should be contained \
                        within paired tick marks (`). Since the tick marks will be removed, if you actually need your \
                        text enclosed by ticks, you will have to double them up at the start and end.',
            args: [
                ['(any)', 'text or internal function; enclose text that includes leading/trailing space with ticks (`)']
            ]
        },
        getattr: {
            msg: 'This function returns either the current or max value for a given attribute.',
            args: [
                ['a', 'attribute id, or (character identifier)|(attribute name)'],
                ['v', 'value you wish to return; default: current; m or max for max'],
                ['h', 'encode for html entitites (preserves output); "t", "true", "y", "yes" map to true; default: false']
            ]
        },
        getabil: {
            msg: 'This function returns the action text for a given ability.',
            args: [
                ['a', 'ability id, or (character)|(ability name)']
            ]
        },
        getmacro: {
            msg: 'This function returns the action text for a given macro.',
            args: [
                ['a', 'macro id or name']
            ]
        },
        puttargets: {
            msg: 'This function inserts a number of targeting constructions (ie, @{target|label|return}) into the command line. Label includes a positional index that counts up from 1.',
            args: [
                ['n', 'number of targets; default: 1'],
                ['l', 'text label for each targeting construction; default: Target'],
                ['r', 'data point to return; default: token_id'],
                delimHelp
            ]
        },
        getselected: {
            msg: 'This function gets a list of the ids of the selected items at the time of the InsertArg call.',
            args: [
                delimHelp
            ]
        },
        getme: {
            msg: 'Gets the id or name of the current speaker (player or character), or the chat speaker output (ie, Player|Name)',
            args: [
                ['r', 'what to return; default: id; "n" and "name" return name, "c" and "cs" return chat speaker, anything else returns the id'],
                formatHelp
            ]
        },
        getsections: {
            msg: 'For a given character, gets the a list of unique section names for repeating elements.',
            args: [
                ['c', 'character identifier (id, name, or token id)'],
                delimHelp,
                formatHelp,
                filterHelp
            ]
        },
        getrepeating: {
            msg: 'For a given character, gets a list of repeating attributes within a given section, using a given sub-attribute as the naming element, and sampling across a sub-attribute supplied to be the action/data element.',
            args: [
                ['c', 'character identifier (id, name, or token id)'],
                delimHelp,
                ['s', 'section name (as returned from getsection); "section" from repeating_section_id_subattr'],
                ['sfxn', 'name portion of the sub-attribute responsible for naming an attribute set from the section; "subattr" from repeating_section_is_subattr<br>if left blank, getrepeating will look for a sub-attribute with the text "name" in the current value'],
                ['sfxa', 'name portion of the sub-attribute you wish to return (for instance, the roll formula); "subattr" from repeating_section_id_subattr'],
                ['sfxrlbl', 'name portion of the sub-attribute you wish to use for button labels if using elem menu output, overwritten by explicit declaration of rlbl'],
                ['v', 'value to retrieve (current or max); default: current; anything other than "m" or "max" maps to current'],
                ['p', 'prompt for query (or nested query) output; default: Select'],
                ['bg', 'css background-color for api button output to override that designated by any config handout; default: (detected from speaker handout, global handout, or default config)'],
                ['css', 'free css input for api button to override that designated by any config handout; default: (detected from speaker handout, global handout, or default config)'],
                ['rlbl', 'label for buttons where the name of the attribute will be outside of the button (for menu construction); default: Roll'],
                outputHelp,
                formatHelp,
                filterHelp,
                ['rlbl', 'standard label for buttons if output is separated into repeating element; default: Roll']
            ]
        },
        getattrs: {
            msg: 'For a given character, gets a list of non-repeating attributes.',
            args: [
                ['c', 'character identifier (id, name, or token id)'],
                delimHelp,
                ['v', 'value to retrieve (current or max); default: current; anything other than "m" or "max" maps to current'],
                ['l', 'list of attributes to retrieve; attributes may be referred to by id or name; each attribute may be followed by a space and then a label to use instead of the attribute name;<br>\
                        list argument must be formatted as<br>\
                        (list delimiter)|(attribute)(list delimiter)(attribute 2)...<br>\
                        for instance, the following line would list attributes named STR and DEX, renamed to Strength and Dexterity, using the delimiter of a pipe<br>\
                        !!l#||STR Strength|DEX Dexterity<br><br>\
                        if left empty, all non-repeating attributes for the character will be retrieved; whatever is retrieved can be filtered by use of the f arg'],
                ['p', 'prompt for query (or nested query) output; default: Select'],
                ['bg', 'css background-color for api button output to override that designated by any config handout; default: (detected from speaker handout, global handout, or default config)'],
                ['css', 'free css input for api button to override that designated by any config handout; default: (detected from speaker handout, global handout, or default config)'],
                outputHelp,
                formatHelp,
                filterHelp,
                ['rlbl', 'standard label for buttons if output is separated into repeating element; default: Roll']
            ]
        },
        getabils: {
            msg: 'For a given character, gets a list of abilities.',
            args: [
                ['c', 'character identifier (id, name, or token id)'],
                delimHelp,
                ['l', 'list of abilities to retrieve; abilities may be referred to by id or name; each ability may be followed by a space and then a label to use instead of the ability\'s name;<br>\
                        list argument must be formatted as<br>\
                        (list delimiter)|(abilities)(list delimiter)(abilities 2)...<br>\
                        for instance, the following line would list abilities named STR and DEX, renamed to Strength and Dexterity, using the delimiter of a pipe<br>\
                        !!l#||STR Strength|DEX Dexterity<br><br>\
                        if left empty, all abilities for the character will be retrieved; whatever is retrieved can be filtered by use of the f arg'],
                ['p', 'prompt for query (or nested query) output; default: Select'],
                ['bg', 'css background-color for api button output to override that designated by any config handout; default: (detected from speaker handout, global handout, or default config)'],
                ['css', 'free css input for api button to override that designated by any config handout; default: (detected from speaker handout, global handout, or default config)'],
                outputHelp,
                formatHelp,
                filterHelp,
                ['rlbl', 'standard label for buttons if output is separated into repeating element; default: Roll']
            ]
        },
        gettokens: {
            msg: 'Retrieves tokens matching the given parameters.',
            args: [
                ['l', 'list of tokens to retrieve'],
                ['v', 'value to return for simple list output (id, name); default: id'],
                ['pg', 'page id to draw tokens from'],
                ['rep', 'whether the tokens should be limited to only those represent characters; default: false'],
                ['lyr', 'pipe-separated layer for tokens, default: token'],
                delimHelp,
                outputHelp,
                filterHelp,
                formatHelp,
                ['rlbl', 'standard label for buttons if output is separated into repeating element; default: Roll']
            ]
        }
    };


    on('ready', () => {
        versionInfo;
        try {
            ia.RegisterRule(puttext, getattr, getabil, getmacro, puttargets, getselected, getme, getsections, getrepeating, getattrs, getabils, gettokens);
            ia.RegisterHelp(help);
        } catch (error) {
            log(error);
            log(`This probably happened because you don't have the IA script installed.`);
        }

    });

    return {
        GetVrs: getVrs
    };
})();
