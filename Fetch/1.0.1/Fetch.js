/*
=========================================================
Name			:	Fetch
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	1.0.1
Last Update		:	4/24/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Fetch = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Fetch.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const Fetch = (() => {
    const apiproject = 'Fetch';
    const version = '0.0.1';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1619321672485);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                    };
                    break;
            }
        }
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const getfirst = (cmd, ...args) => {
        // pass in objects of form: {type: 'text', rx: /regex/}
        // return object of form  : {regex exec object with property 'type': 'text'}

        let ret = {};
        let r;
        args.find(a => {
            r = a.rx.exec(cmd);
            if (r && (!ret.length || r.index < ret.index)) {
                ret = Object.assign(r, { type: a.type });
            }
            a.lastIndex = 0;
        }, ret);
        return ret;
    };
    const getEditDistance = (a, b) => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    };
    const repeatingOrdinal = (character_id, section = '', attr_name = '') => {
        if (!section && !attr_name) return;
        let ordrx, match;
        if (attr_name) {
            ordrx = /^repeating_([^_]+)_([^_]+)_.*$/;
            if (!ordrx.test(attr_name)) return; // the supplied attribute name isn't a repeating attribute at all
            match = ordrx.exec(attr_name);
            section = match[1];
        }
        let sectionrx = new RegExp(`repeating_${section}_([^_]+)_.*$`);
        let createOrderKeys = [...new Set(findObjs({ type: 'attribute', characterid: character_id })
            .filter(a => sectionrx.test(a.get('name')))
            .map(a => sectionrx.exec(a.get('name'))[1]))];
        let sortOrderKeys = (findObjs({ type: 'attribute', characterid: character_id, name: `_reporder_repeating_${section}` })[0] || { get: () => { return ''; } })
            .get('current')
            .split(/\s*,\s*/)
            .filter(a => createOrderKeys.includes(a));
        sortOrderKeys.push(...createOrderKeys.filter(a => !sortOrderKeys.includes(a)));
        return attr_name ? sortOrderKeys.indexOf(match[2]) : sortOrderKeys;
    };
    const parsePattern = (cmd) => {
        const fieldcomprx = /^((?<retrieve>m)\s*\|)?\s*^(?<field>[^\s]+?)\s*(?<operator>>=|<=|~|!~|=|!=|<|>)\s*((`|'|")(?<value>.*?)\6|(?<altvalue>.*?)(?=\s|$))\s*/i;
        const fieldrx = /^((?<retrieve>m)\s*\|)?\s*(?<field>[^\s]+)\s*/i;
        const fieldcomptm = { rx: fieldcomprx, type: 'fieldcomp' },
            fieldtm = { rx: fieldrx, type: 'field' };
        let index = 0;
        let p = {};
        let tokens = [];
        while (!/^$/.test(cmd.slice(index))) {
            p = getfirst(cmd.slice(index), fieldcomptm, fieldtm);
            if (p) {
                if (p.type === 'field') tokens.push({ type: '=', contents: [p.groups.field, true], retrieve: p.groups.retrieve ? 'max' : 'current' });
                else tokens.push({ type: p.groups.operator, contents: [p.groups.field, p.groups.value || p.groups.altvalue], retrieve: p.groups.retrieve ? 'max' : 'current' });
                index += p[0].length;
            } else {
                return { tokens: [], error: `Unexpected token encountered in repeating pattern: ${cmd}` };
            }
        }
        return { tokens: tokens };
    };

    const getSheetItem = (res, pid, char) => {
        // expects result of the getFirst() function, a rx result with a type property
        // r.type === 'sheetitem'
        const itemTypeLib = {
            '@': 'attribute',
            '*': 'attribute',
            '%': 'ability'
        }
        let c = char || getChar(res.groups.character, pid);
        if (!c) return;
        // standard sheet items
        if (['@', '%'].includes(res.groups.type)) {
            let sheetobj = findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
                .filter(a => a.get('name') === res.groups.item)[0];
            return sheetobj;
        }
        // if we're still here, we're looking for a repeating item
        let p = parsePattern(res.groups.pattern);
        if (!p.tokens.length) {
            log(p.error || 'No pattern detected for repeating sheet item.');
            return;
        }

        let filterLib = {
            '=': (a) => a.contents[0] == a.contents[1],
            '!=': (a) => a.contents[0] != a.contents[1],
            '~': (a) => a.contents[0].includes(a.contents[1]),
            '!~': (a) => !a.contents[0].includes(a.contents[1]),
            '>': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) > (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '>=': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) >= (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '<': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) < (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '<=': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) <= (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1])
        }

        p.tests = [];
        let reprx = new RegExp(`^repeating_${res.groups.section}_(?<repID>[^_]*?)_(?<suffix>.+)$`);
        let repres;
        let o = findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
            .filter(a => reprx.test(a.get('name')));
        o.forEach(a => {
            reprx.lastIndex = 0;
            repres = reprx.exec(a.get('name'));
            a.name = a.get('name');
            a.repID = repres.groups.repID;
            a.suffix = repres.groups.suffix;
        });

        let viable = [];
        p.tokens.forEach(s => {
            viable = [];
            o.forEach(a => {
                if (a.suffix.toLowerCase() === s.contents[0].toLowerCase()) {
                    if (filterLib[s.type]({ contents: [a.get(s.retrieve), s.contents[1]] })) viable.push(a.repID);
                }
            });
            p.tests.push(viable);
        });
        // we should have the same number of tests as we do testable conditions
        if (p.tests.length !== p.tokens.length) {
            log(`EXITING: TEST COUNTS DON'T MATCH`);
            return;
        }
        viable = p.tests.reduce((m, v) => m.filter(repID => v.includes(repID)));
        if (viable.length) {
            let retObj = findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
                .filter(a => a.get('name') === `repeating_${res.groups.section}_${viable[0]}_${res.groups.valuesuffix}`)[0];
            return retObj;
        }
    };
    const getSheetItemVal = (res, pid, char) => {
        // expects the result of a rx with groups
        let val = '',
            retrieve = '',
            o = {};
        // determine what to test; also what to retrieve if another value isn't specified
        if (['@', '*'].includes(res.groups.type) && res.groups.valtype !== 'max') {
            retrieve = 'current';
        } else if (['@', '*'].includes(res.groups.type)) {
            retrieve = 'max';
        } else {
            retrieve = 'action';
        }
        // determine if a different retrievable info is requested
        if (res.groups.type === '*' && res.groups.valtype === 'name$') {
            retrieve = 'name$';
        } else if (res.groups.type === '*' && res.groups.valtype === 'row$') {
            retrieve = 'row$';
        } else if (res.groups.valtype === 'name') {
            retrieve = 'name';
        } else if (res.groups.valtype === 'id') {
            retrieve = 'id';
        }
        // go get the item
        o = getSheetItem(res, pid, char);
        if (!o) {
            return;
        } else {
            if (['name', 'action', 'current', 'max', 'id'].includes(retrieve)) {
                val = o.get(retrieve);
            } else {
                val = o.get('name');
                let row,
                    rptrx = /^repeating_([^_]+)_([^_]+)_(.*)$/i,
                    rptres;
                switch (retrieve) {
                    case 'row$':
                        val = `$${repeatingOrdinal(o.get('characterid'), undefined, o.get('name'))}`;
                        break;
                    case 'name$':
                        row = `$${repeatingOrdinal(o.get('characterid'), undefined, o.get('name'))}`;
                        rptres = rptrx.exec(o.get('name'));
                        val = `repeating_${rptres[1]}_${row}_${rptres[3]}`;
                        break;
                    case 'rowid':
                    case 'elemid':
                        val = (rptrx.exec(o.get('name')) || [undefined, undefined, undefined])[2];
                        break;
                    default:
                }
            }
        }
        return val;
    };

    const getChar = (query, pid) => { // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = findObjs({ type: 'character' });
        charsIControl = playerIsGM(pid) ? charsIControl : charsIControl.filter(c => c.get('controlledby').split(',').includes(pid));
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => qrx.test(c)).reduce((m, v) => {
                let d = getEditDistance(query, v);
                return !m.length || d < m[1] ? [v, d] : m;
            }, [])[0];
        return character;
    };

    const getToken = (info) => {
        return findObjs({ type: 'graphic', subtype: 'token', id: info })[0];
    };
    const tokenProps = {
        cardid: '_cardid',
        cid: '_cardid',
        tid: '_id',
        token_id: '_id',
        pageid: '_pageid',
        pid: '_pageid',
        sub: '_subtype',
        subtype: '_subtype',
        token_type: '_type',
        adv_fow_view_distance: 'adv_fow_view_distance',
        aura1: 'aura1_color',
        aura1_color: 'aura1_color',
        aura1_radius: 'aura1_radius',
        radius1: 'aura1_radius',
        aura1_square: 'aura1_square',
        square1: 'aura1_square',
        aura2: 'aura2_color',
        aura2_color: 'aura2_color',
        aura2_radius: 'aura2_radius',
        radius2: 'aura2_radius',
        aura2_square: 'aura2_square',
        square2: 'aura2_square',
        bar1_link: 'bar1_link',
        link1: 'bar1_link',
        bar1_max: 'bar1_max',
        max1: 'bar1_max',
        bar1: 'bar1_value',
        bar1_current: 'bar1_value',
        bar1_value: 'bar1_value',
        bar2_link: 'bar2_link',
        link2: 'bar2_link',
        bar2_max: 'bar2_max',
        max2: 'bar2_max',
        bar2: 'bar2_value',
        bar2_current: 'bar2_value',
        bar2_value: 'bar2_value',
        bar3_link: 'bar3_link',
        link3: 'bar3_link',
        bar3_max: 'bar3_max',
        max3: 'bar3_max',
        bar3: 'bar3_value',
        bar3_current: 'bar3_value',
        bar3_value: 'bar3_value',
        bright_light_distance: 'bright_light_distance',
        token_cby: 'controlledby',
        token_controlledby: 'controlledby',
        currentside: 'currentSide',
        curside: 'currentSide',
        side: 'currentSide',
        dim_light_opacity: 'dim_light_opacity',
        directional_bright_light_center: 'directional_bright_light_center',
        directional_bright_light_total: 'directional_bright_light_total',
        directional_low_light_center: 'directional_low_light_center',
        directional_low_light_total: 'directional_low_light_total',
        emits_bright: 'emits_bright_light',
        emits_bright_light: 'emits_bright_light',
        emits_low: 'emits_low_light',
        emits_low_light: 'emits_low_light',
        fliph: 'fliph',
        flipv: 'flipv',
        gmnotes: 'gmnotes',
        has_bright_light_vision: 'has_bright_light_vision',
        has_directional_bright_light: 'has_directional_bright_light',
        has_directional_low_light: 'has_directional_low_light',
        has_limit_field_of_night_vision: 'has_limit_field_of_night_vision',
        has_limit_field_of_vision: 'has_limit_field_of_vision',
        has_night_vision: 'has_night_vision',
        has_nv: 'has_night_vision',
        nv_has: 'has_night_vision',
        height: 'height',
        imgsrc: 'imgsrc',
        drawing: 'isdrawing',
        isdrawing: 'isdrawing',
        lastmove: 'lastmove',
        layer: 'layer',
        left: 'left',
        light_angle: 'light_angle',
        light_dimradius: 'light_dimradius',
        light_hassight: 'light_hassight',
        light_losangle: 'light_losangle',
        light_multiplier: 'light_multiplier',
        light_otherplayers: 'light_otherplayers',
        light_radius: 'light_radius',
        limit_field_of_night_vision_center: 'limit_field_of_night_vision_center',
        limit_field_of_night_vision_total: 'limit_field_of_night_vision_total',
        limit_field_of_vision_center: 'limit_field_of_vision_center',
        limit_field_of_vision_total: 'limit_field_of_vision_total',
        low_light_distance: 'low_light_distance',
        token_name: 'name',
        night_vision_distance: 'night_vision_distance',
        nv_dist: 'night_vision_distance',
        nv_distance: 'night_vision_distance',
        night_vision_tint: 'night_vision_tint',
        nv_tint: 'night_vision_tint',
        playersedit_aura1: 'playersedit_aura1',
        playersedit_aura2: 'playersedit_aura2',
        playersedit_bar1: 'playersedit_bar1',
        playersedit_bar2: 'playersedit_bar2',
        playersedit_bar3: 'playersedit_bar3',
        playersedit_name: 'playersedit_name',
        represents: 'represents',
        reps: 'represents',
        rotation: 'rotation',
        showname: 'showname',
        showplayers_aura1: 'showplayers_aura1',
        showplayers_aura2: 'showplayers_aura2',
        showplayers_bar1: 'showplayers_bar1',
        showplayers_bar2: 'showplayers_bar2',
        showplayers_bar3: 'showplayers_bar3',
        showplayers_name: 'showplayers_name',
        sides: 'sides',
        markers: 'statusmarkers',
        statusmarkers: 'statusmarkers',
        tint: 'tint_color',
        tint_color: 'tint_color',
        top: 'top',
        width: 'width'
    };
    const charProps = {
        char_id: '_id',
        character_id: '_id',
        character_type: '_type',
        char_type: '_type',
        avatar: 'avatar',
        char_name: 'name',
        character_name: 'name',
        archived: 'archived',
        inplayerjournals: 'inplayerjournals',
        character_controlledby: 'controlledby',
        character_cby: 'controlledby',
        char_cby: 'controlledby',
        char_controlledby: 'controlledby',
        defaulttoken: '_defaulttoken'
    };
    const tokenrx = /@\((?<token>selected|(?:[A-Za-z0-9\-_]{20}))[|.](?<item>[^\s[|.)]+?)(?:[|.](?<valtype>[^\s.[|]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const sheetitemrx = /(?<type>(?:@|%))\((?<character>[^|.]+?)[|.](?<item>[^\s.[|)]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.]\[\s*(?<pattern>.+?)\s*]\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;

    const testConstructs = c => {
        let result = tokenrx.test(c) || sheetitemrx.test(c) || rptgitemrx.test(c);
        tokenrx.lastIndex = 0;
        sheetitemrx.lastIndex = 0;
        rptgitemrx.lastIndex = 0;
        return result;
    };
    const simpleObj = (o) => JSON.parse(JSON.stringify(o));
    const handleInput = (msg, msgstate) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!msgstate && scriptisplugin) return funcret;

        while (tokenrx.test(msg.content) || sheetitemrx.test(msg.content) || rptgitemrx.test(msg.content)) {
            tokenrx.lastIndex = 0;
            sheetitemrx.lastIndex = 0;
            rptgitemrx.lastIndex = 0;

            // TOKENS
            msg.content = msg.content.replace(tokenrx, (m, token, item, valtype, def = '') => {
                let source;
                let sourcechar;
                let retval;
                switch (token.toLowerCase()) {
                    case 'selected':
                        if (!msg.selected) {
                            retval = def;
                        } else {
                            if (Object.keys(tokenProps).includes(item.toLowerCase())) {                   // selected + token property = return token property || default
                                source = simpleObj(getToken(msg.selected[0]._id) || {});
                                retval = source[tokenProps[item.toLowerCase()]];
                                if (typeof retval === 'undefined') retval = def;
                            } else {                                                        // selected + character attribute = return character attribute info || default
                                sourcechar = getChar(msg.selected[0]._id, msg.playerid);
                                source = simpleObj(sourcechar || {});
                                if (!Object.keys(source).length) {
                                    retval = def;
                                } else {
                                    if (Object.keys(charProps).includes(item.toLowerCase())) {
                                        retval = source[charProps[item.toLowerCase()]];
                                        if (typeof retval === 'undefined') retval = def;
                                    } else {
                                        retval = getSheetItemVal({ groups: { type: '@', character: source._id, item: item, valtype: valtype } }, msg.playerid, sourcechar);
                                        if (typeof retval === 'undefined') retval = def;
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        source = simpleObj(getToken(token) || {});
                        if (!Object.keys(source).length && Object.keys(tokenProps).includes(item.toLowerCase())) {        // no token found + token property = return default
                            retval = def;
                        } else if (Object.keys(source).length && Object.keys(tokenProps).includes(item.toLowerCase())) {  // token + token property = return token property || default
                            retval = source[tokenProps[item.toLowerCase()]];
                            if (typeof retval === 'undefined') retval = def;
                        } else if (Object.keys(source).length && !Object.keys(tokenProps).includes(item.toLowerCase())) { // token + character attribute = return character attribute info || default
                            sourcechar = getChar(token, msg.playerid);
                            source = simpleObj(sourcechar || {});
                            if (!Object.keys(source).length) {
                                retval = def;
                            } else {
                                if (Object.keys(charProps).includes(item.toLowerCase())) {
                                    retval = source[charProps[item.toLowerCase()]];
                                    if (typeof retval === 'undefined') retval = def;
                                } else {
                                    retval = getSheetItemVal({ groups: { type: '@', character: source._id, item: item, valtype: valtype } }, msg.playerid, sourcechar);
                                    if (typeof retval === 'undefined') retval = def;
                                }
                            }
                        } else {                                                        // not a token (character or non existent) = leave everything to be caught by the later rx statements
                            retval = m;
                        }
                }
                if (retval) Object.assign(funcret, { runloop: true, status: 'changed' });
                return retval;
            });

            // STANDARD SHEET ITEMS
            msg.content = msg.content.replace(sheetitemrx, (m, type, character, item, valtype, def = '') => {
                let retval;
                if (character.toLowerCase() === 'speaker') character = msg.who;
                let sourcechar = getChar(character, msg.playerid);
                let source = simpleObj(sourcechar || {});
                if (!sourcechar) {
                    retval = def;
                } else {
                    if (Object.keys(charProps).includes(item.toLowerCase())) {
                        retval = source[charProps[item.toLowerCase()]];
                        if (typeof retval === 'undefined') retval = def;
                    } else {
                        retval = getSheetItemVal({ groups: { type: type, character: sourcechar.id, item: item, valtype: valtype } }, msg.playerid, sourcechar);
                        if (typeof retval === 'undefined') retval = def;
                    }
                }
                if (retval) Object.assign(funcret, { runloop: true, status: 'changed' });
                return retval;
            });

            // REPEATING SHEET ITEMS
            msg.content = msg.content.replace(rptgitemrx, (m, type, character, section, pattern, valuesuffix, valtype, def = '') => {
                let retval;
                let sourcechar;
                switch (character.toLowerCase()) {
                    case 'selected':
                        if (!msg.selected) {
                            retval = def;
                        } else {
                            sourcechar = getChar(msg.selected[0]._id, msg.playerid);
                        }
                        break;
                    case 'speaker':
                        sourcechar = getChar(msg.who, msg.playerid);
                        break;
                    default:
                        sourcechar = getChar(character, msg.playerid);
                }

                if (!sourcechar) {
                    retval = def;
                } else {
                    retval = getSheetItemVal({ groups: { type: type, character: sourcechar.id, valtype: valtype, section: section, pattern: pattern, valuesuffix: valuesuffix } }, msg.playerid, sourcechar);
                    if (typeof retval === 'undefined') retval = def;
                }
                if (retval) Object.assign(funcret, { runloop: true, status: 'changed' });
                return retval;
            });

        }
        return funcret;
    };

    let scriptisplugin = false;
    const fetch = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(fetch);
        }
    });
    return {
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Fetch.offset); } }