/*
=========================================================
Name			:	Fetch
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/Fetch
Roll20 Contact	:	timmaugh
Version			:   2.0.0
Last Update		:	9/20/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Fetch = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Fetch.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const Fetch = (() => {
    const apiproject = 'Fetch';
    const version = '2.0.0';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1663694446807);
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
    const generateUUID = (() => {
        let a = 0;
        let b = [];

        return () => {
            let c = (new Date()).getTime() + 0;
            let f = 7;
            let e = new Array(8);
            let d = c === a;
            a = c;
            for (; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++) {
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    })();

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
        c.id = c.id || c._id;
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
        } else if (res.groups.valtype === 'rowid') {
            retrieve = 'rowid';
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
                let row;
                let rptrx = /^repeating_([^_]+)_([^_]+)_(.*)$/i;
                let rptres = rptrx.exec(val) || [undefined, undefined, '', ''];
                switch (retrieve) {
                    case 'row$':
                        val = `$${repeatingOrdinal(o.get('characterid'), undefined, val)}`;
                        break;
                    case 'name$':
                        row = `$${repeatingOrdinal(o.get('characterid'), undefined, val)}`;
                        val = `repeating_${rptres[1]}_${row}_${rptres[3]}`;
                        break;
                    case 'rowid':
                        val = rptres[2];
                        break;
                    default:
                }
            }
        }
        return val;
    };

    const getChar = (query, pid) => { // find a character where query is an identifying piece of information (id, name, or token id)
        let character;
        if (typeof query !== 'string') return character;
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
    const getPlayer = (query) => {
        return findObjs({ type: 'player', id: query })[0] ||
            findObjs({ type: 'player' }).filter(p => { return [query.toLowerCase(), query.toLowerCase() + ' (gm)', query.replace(/\s\(gm\)$/i, '').toLowerCase()].includes(p.get('_displayname').toLowerCase()); })[0];
    };
    const getPage = (query) => {
        return findObjs({ type: 'page', id: query })[0] ||
            findObjs({ type: 'page' }).filter(p => { return p.get('name') === query; })[0];
    };
    const decomposeStatuses = (list = '') => {
        return list.split(/\s*,\s*/g).filter(s => s.length)
            .reduce((m, s) => {
                let origst = libTokenMarkers.getStatus(s.slice(0, /(@\d+$|:)/.test(s) ? /(@\d+$|:)/.exec(s).index : s.length));
                let st = _.clone(origst);
                if (!st) return m;
                st.num = /^.+@0*(\d+)/.test(s) ? /^.+@0*(\d+)/.exec(s)[1] : '';
                st.html = origst.getHTML();
                st.url = st.url || '';
                m.push(st);
                return m;
            }, []);
    };
    class StatusBlock {
        constructor({ token: token = {}, msgId: msgId = generateUUID() } = {}) {
            this.token = token;
            this.msgId = msgId;
            this.statuses = (decomposeStatuses(token.statusmarkers) || []).reduce((m, s) => {
                m[s.name] = m[s.name] || []
                m[s.name].push(Object.assign({}, s, { is: 'yes' }));
                return m;
            }, {});
        }
    }

    const tokenStatuses = {};
    const getStatus = (t, query, msgId) => {
        let token, rxret, status, index, modindex, statusblock;
        token = getToken(t);
        if (!token) return;
        token = simpleObj(token);
        if (!tokenStatuses.hasOwnProperty(token.id) || tokenStatuses[token.id].msgId !== msgId) {
            tokenStatuses[token.id] = new StatusBlock({ token: token, msgId: msgId });
        }
        rxret = /(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(query);
        [status, index] = [rxret.groups.marker, rxret.groups.index];
        if (!index) {
            modindex = 1;
        } else if (['all', 'all+'].includes(index.toLowerCase())) {
            modindex = index.toLowerCase();
        } else {
            modindex = Number(index);
        }
        statusblock = tokenStatuses[token.id].statuses[status];
        if (!statusblock || !statusblock.length) {
            return { is: 'no', count: '0' };
        };
        switch (index) {
            case 'all':
                return statusblock.reduce((m, sm) => {
                    m.num = `${m.num || ''}${sm.num}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, {});
                break;
            case 'all+':
                return statusblock.reduce((m, sm) => {
                    m.num = `${Number(m.num || 0) + Number(sm.num)}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, {});
                break;
            default:
                if (statusblock.length >= modindex) {
                    return Object.assign({}, statusblock[modindex - 1], { count: index ? '1' : statusblock.length });
                } else {
                    return { is: 'no', 'count': '0' };
                }
        }
    };
    const getMarker = (query) => {
        if (libTokenMarkers.getStatus(query).getTag().length) return decomposeStatuses(query)[0];
    };

    const getPageID = (pid) => {
        return (pid && playerIsGM(pid)) ? (getObj('player', pid).get('_lastpage') || Campaign().get('playerpageid')) : Campaign().get('playerpageid');
    };
    const getTrackerVal = (token) => {
        let retval = {};
        let to = JSON.parse(Campaign().get('turnorder') || '[]');
        let mto = to.map(t => t.id);
        if (mto.includes(token.id)) {
            retval.tracker = to.filter(t => t.id === token.id)[0].pr;
            retval.tracker_offset = mto.indexOf(token.id);
        }
        return retval;
    };
    const getToken = (info, pgid = '') => {
        let token = findObjs({ type: 'graphic', subtype: 'token', id: info })[0] ||
            findObjs({ type: 'graphic', subtype: 'card', id: info })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', name: info, pageid: pgid })[0];
        if (token && token.id) {
            token = Object.assign(simpleObj(token), getTrackerVal(token));
        }
        return token;
    };
    const getObjName = (key, type) => {
        let o;
        switch (type) {
            case 'playerlist':
                o = key.split(/\s*,\s*/)
                    .map(k => k === 'all' ? k : getObj('player', k))
                    .filter(c => c)
                    .map(c => c === 'all' ? c : c.get('displayname'))
                    .join(', ');
                return o.length ? o : undefined;
            case 'page':
            case 'attribute':
            case 'character':
            default:
                o = getObj(type, key);
                return o ? o.get('name') : undefined;
        }
    };
    const tokenProps = {
        cardid: { refersto: '_cardid', permissionreq: 'any', dataval: (d) => d },
        cid: { refersto: '_cardid', permissionreq: 'any', dataval: (d) => d },
        tid: { refersto: '_id', permissionreq: 'any', dataval: (d) => d },
        token_id: { refersto: '_id', permissionreq: 'any', dataval: (d) => d },
        token_name: { refersto: 'name', permissionreq: 'any', dataval: (d) => d },
        page_id: { refersto: '_pageid', permissionreq: 'any', dataval: (d) => d },
        pageid: { refersto: '_pageid', permissionreq: 'any', dataval: (d) => d },
        pid: { refersto: '_pageid', permissionreq: 'any', dataval: (d) => d },
        token_page_id: { refersto: '_pageid', permissionreq: 'any', dataval: (d) => d },
        token_pageid: { refersto: '_pageid', permissionreq: 'any', dataval: (d) => d },
        token_pid: { refersto: '_pageid', permissionreq: 'any', dataval: (d) => d },
        page: { refersto: '_pageid', permissionreq: 'any', dataval: d => getObjName(d, 'page') },
        page_name: { refersto: '_pageid', permissionreq: 'any', dataval: d => getObjName(d, 'page') },
        sub: { refersto: '_subtype', permissionreq: 'any', dataval: (d) => d },
        subtype: { refersto: '_subtype', permissionreq: 'any', dataval: (d) => d },
        token_type: { refersto: '_type', permissionreq: 'any', dataval: (d) => d },
        adv_fow_view_distance: { refersto: 'adv_fow_view_distance', permissionreq: 'any', dataval: (d) => d },
        aura1: { refersto: 'aura1_color', permissionreq: 'any', dataval: (d) => d },
        aura1_color: { refersto: 'aura1_color', permissionreq: 'any', dataval: (d) => d },
        aura1_radius: { refersto: 'aura1_radius', permissionreq: 'any', dataval: (d) => d },
        radius1: { refersto: 'aura1_radius', permissionreq: 'any', dataval: (d) => d },
        aura1_square: { refersto: 'aura1_square', permissionreq: 'any', dataval: (d) => d },
        square1: { refersto: 'aura1_square', permissionreq: 'any', dataval: (d) => d },
        aura2: { refersto: 'aura2_color', permissionreq: 'any', dataval: (d) => d },
        aura2_color: { refersto: 'aura2_color', permissionreq: 'any', dataval: (d) => d },
        aura2_radius: { refersto: 'aura2_radius', permissionreq: 'any', dataval: (d) => d },
        radius2: { refersto: 'aura2_radius', permissionreq: 'any', dataval: (d) => d },
        aura2_square: { refersto: 'aura2_square', permissionreq: 'any', dataval: (d) => d },
        square2: { refersto: 'aura2_square', permissionreq: 'any', dataval: (d) => d },
        bar_location: { refersto: 'bar_location', permissionreq: 'any', dataval: (d) => d },
        bar_loc: { refersto: 'bar_location', permissionreq: 'any', dataval: (d) => d },
        bar1_link: { refersto: 'bar1_link', permissionreq: 'any', dataval: (d) => d },
        link1: { refersto: 'bar1_link', permissionreq: 'any', dataval: (d) => d },
        bar1_name: { refersto: 'bar1_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name1: { refersto: 'bar1_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar1_max: { refersto: 'bar1_max', permissionreq: 'any', dataval: (d) => d },
        max1: { refersto: 'bar1_max', permissionreq: 'any', dataval: (d) => d },
        bar1: { refersto: 'bar1_value', permissionreq: 'any', dataval: (d) => d },
        bar1_current: { refersto: 'bar1_value', permissionreq: 'any', dataval: (d) => d },
        bar1_value: { refersto: 'bar1_value', permissionreq: 'any', dataval: (d) => d },
        bar2_link: { refersto: 'bar2_link', permissionreq: 'any', dataval: (d) => d },
        link2: { refersto: 'bar2_link', permissionreq: 'any', dataval: (d) => d },
        bar2_name: { refersto: 'bar2_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name2: { refersto: 'bar2_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar2_max: { refersto: 'bar2_max', permissionreq: 'any', dataval: (d) => d },
        max2: { refersto: 'bar2_max', permissionreq: 'any', dataval: (d) => d },
        bar2: { refersto: 'bar2_value', permissionreq: 'any', dataval: (d) => d },
        bar2_current: { refersto: 'bar2_value', permissionreq: 'any', dataval: (d) => d },
        bar2_value: { refersto: 'bar2_value', permissionreq: 'any', dataval: (d) => d },
        bar3_link: { refersto: 'bar3_link', permissionreq: 'any', dataval: (d) => d },
        link3: { refersto: 'bar3_link', permissionreq: 'any', dataval: (d) => d },
        bar3_name: { refersto: 'bar3_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name3: { refersto: 'bar3_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar3_max: { refersto: 'bar3_max', permissionreq: 'any', dataval: (d) => d },
        max3: { refersto: 'bar3_max', permissionreq: 'any', dataval: (d) => d },
        bar3: { refersto: 'bar3_value', permissionreq: 'any', dataval: (d) => d },
        bar3_current: { refersto: 'bar3_value', permissionreq: 'any', dataval: (d) => d },
        bar3_value: { refersto: 'bar3_value', permissionreq: 'any', dataval: (d) => d },
        bright_light_distance: { refersto: 'bright_light_distance', permissionreq: 'any', dataval: (d) => d },
        compact_bar: { refersto: 'compact_bar', permissionreq: 'any', dataval: (d) => d },
        token_cby: { refersto: 'controlledby', permissionreq: 'any', dataval: (d) => d },
        token_controlledby: { refersto: 'controlledby', permissionreq: 'any', dataval: (d) => d },
        token_cby_names: { refersto: 'controlledby', permissionreq: 'any', dataval: d => getObjName(d, 'playerlist') },
        token_controlledby_names: { refersto: 'controlledby', permissionreq: 'any', dataval: d => getObjName(d, 'playerlist') },
        token_cby_name: { refersto: 'controlledby', permissionreq: 'any', dataval: d => getObjName(d, 'playerlist') },
        token_controlledby_name: { refersto: 'controlledby', permissionreq: 'any', dataval: d => getObjName(d, 'playerlist') },
        currentside: { refersto: 'currentSide', permissionreq: 'any', dataval: (d) => d },
        curside: { refersto: 'currentSide', permissionreq: 'any', dataval: (d) => d },
        side: { refersto: 'currentSide', permissionreq: 'any', dataval: (d) => d },
        dim_light_opacity: { refersto: 'dim_light_opacity', permissionreq: 'any', dataval: (d) => d },
        directional_bright_light_center: { refersto: 'directional_bright_light_center', permissionreq: 'any', dataval: (d) => d },
        directional_bright_light_total: { refersto: 'directional_bright_light_total', permissionreq: 'any', dataval: (d) => d },
        directional_low_light_center: { refersto: 'directional_low_light_center', permissionreq: 'any', dataval: (d) => d },
        directional_low_light_total: { refersto: 'directional_low_light_total', permissionreq: 'any', dataval: (d) => d },
        emits_bright: { refersto: 'emits_bright_light', permissionreq: 'any', dataval: (d) => d },
        emits_bright_light: { refersto: 'emits_bright_light', permissionreq: 'any', dataval: (d) => d },
        emits_low: { refersto: 'emits_low_light', permissionreq: 'any', dataval: (d) => d },
        emits_low_light: { refersto: 'emits_low_light', permissionreq: 'any', dataval: (d) => d },
        fliph: { refersto: 'fliph', permissionreq: 'any', dataval: (d) => d },
        flipv: { refersto: 'flipv', permissionreq: 'any', dataval: (d) => d },
        gmnotes: { refersto: 'gmnotes', permissionreq: 'gm', dataval: (d) => unescape(d) },
        has_bright_light_vision: { refersto: 'has_bright_light_vision', permissionreq: 'any', dataval: (d) => d },
        has_directional_bright_light: { refersto: 'has_directional_bright_light', permissionreq: 'any', dataval: (d) => d },
        has_directional_low_light: { refersto: 'has_directional_low_light', permissionreq: 'any', dataval: (d) => d },
        has_limit_field_of_night_vision: { refersto: 'has_limit_field_of_night_vision', permissionreq: 'any', dataval: (d) => d },
        has_limit_field_of_vision: { refersto: 'has_limit_field_of_vision', permissionreq: 'any', dataval: (d) => d },
        has_night_vision: { refersto: 'has_night_vision', permissionreq: 'any', dataval: (d) => d },
        has_nv: { refersto: 'has_night_vision', permissionreq: 'any', dataval: (d) => d },
        nv_has: { refersto: 'has_night_vision', permissionreq: 'any', dataval: (d) => d },
        height: { refersto: 'height', permissionreq: 'any', dataval: (d) => d },
        imgsrc: { refersto: 'imgsrc', permissionreq: 'any', dataval: (d) => d },
        imgsrc_short: { refersto: 'imgsrc', permissionreq: 'any', dataval: (d) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length) },
        drawing: { refersto: 'isdrawing', permissionreq: 'any', dataval: (d) => d },
        isdrawing: { refersto: 'isdrawing', permissionreq: 'any', dataval: (d) => d },
        lastmove: { refersto: 'lastmove', permissionreq: 'any', dataval: (d) => d },
        lastx: { refersto: 'lastmove', permissionreq: 'any', dataval: d => d.split(/\s*,\s*/)[0] || '' },
        lasty: { refersto: 'lastmove', permissionreq: 'any', dataval: d => d.split(/\s*,\s*/)[1] || '' },
        layer: { refersto: 'layer', permissionreq: 'gm', dataval: (d) => d },
        left: { refersto: 'left', permissionreq: 'any', dataval: (d) => d },
        light_angle: { refersto: 'light_angle', permissionreq: 'any', dataval: (d) => d },
        light_dimradius: { refersto: 'light_dimradius', permissionreq: 'any', dataval: (d) => d },
        light_hassight: { refersto: 'light_hassight', permissionreq: 'any', dataval: (d) => d },
        light_losangle: { refersto: 'light_losangle', permissionreq: 'any', dataval: (d) => d },
        light_multiplier: { refersto: 'light_multiplier', permissionreq: 'any', dataval: (d) => d },
        light_otherplayers: { refersto: 'light_otherplayers', permissionreq: 'any', dataval: (d) => d },
        light_radius: { refersto: 'light_radius', permissionreq: 'any', dataval: (d) => d },
        light_sensitivity_multiplier: { refersto: 'light_sensitivity_multiplier', permissionreq: 'any', dataval: (d) => d },
        light_sensitivity_mult: { refersto: 'light_sensitivity_multiplier', permissionreq: 'any', dataval: (d) => d },
        limit_field_of_night_vision_center: { refersto: 'limit_field_of_night_vision_center', permissionreq: 'any', dataval: (d) => d },
        limit_field_of_night_vision_total: { refersto: 'limit_field_of_night_vision_total', permissionreq: 'any', dataval: (d) => d },
        limit_field_of_vision_center: { refersto: 'limit_field_of_vision_center', permissionreq: 'any', dataval: (d) => d },
        limit_field_of_vision_total: { refersto: 'limit_field_of_vision_total', permissionreq: 'any', dataval: (d) => d },
        low_light_distance: { refersto: 'low_light_distance', permissionreq: 'any', dataval: (d) => d },
        night_vision_distance: { refersto: 'night_vision_distance', permissionreq: 'any', dataval: (d) => d },
        nv_dist: { refersto: 'night_vision_distance', permissionreq: 'any', dataval: (d) => d },
        nv_distance: { refersto: 'night_vision_distance', permissionreq: 'any', dataval: (d) => d },
        night_vision_effect: { refersto: 'night_vision_effect', permissionreq: 'any', dataval: (d) => d },
        nv_effect: { refersto: 'night_vision_effect', permissionreq: 'any', dataval: (d) => d },
        night_vision_tint: { refersto: 'night_vision_tint', permissionreq: 'any', dataval: (d) => d },
        nv_tint: { refersto: 'night_vision_tint', permissionreq: 'any', dataval: (d) => d },
        playersedit_aura1: { refersto: 'playersedit_aura1', permissionreq: 'any', dataval: (d) => d },
        playersedit_aura2: { refersto: 'playersedit_aura2', permissionreq: 'any', dataval: (d) => d },
        playersedit_bar1: { refersto: 'playersedit_bar1', permissionreq: 'any', dataval: (d) => d },
        playersedit_bar2: { refersto: 'playersedit_bar2', permissionreq: 'any', dataval: (d) => d },
        playersedit_bar3: { refersto: 'playersedit_bar3', permissionreq: 'any', dataval: (d) => d },
        playersedit_name: { refersto: 'playersedit_name', permissionreq: 'any', dataval: (d) => d },
        represents: { refersto: 'represents', permissionreq: 'any', dataval: (d) => d },
        reps: { refersto: 'represents', permissionreq: 'any', dataval: (d) => d },
        represents_name: { refersto: 'represents', permissionreq: 'any', dataval: d => getObjName(d, 'character') },
        reps_name: { refersto: 'represents', permissionreq: 'any', dataval: d => getObjName(d, 'character') },
        rotation: { refersto: 'rotation', permissionreq: 'any', dataval: (d) => d },
        showname: { refersto: 'showname', permissionreq: 'any', dataval: (d) => d },
        showplayers_aura1: { refersto: 'showplayers_aura1', permissionreq: 'any', dataval: (d) => d },
        showplayers_aura2: { refersto: 'showplayers_aura2', permissionreq: 'any', dataval: (d) => d },
        showplayers_bar1: { refersto: 'showplayers_bar1', permissionreq: 'any', dataval: (d) => d },
        showplayers_bar2: { refersto: 'showplayers_bar2', permissionreq: 'any', dataval: (d) => d },
        showplayers_bar3: { refersto: 'showplayers_bar3', permissionreq: 'any', dataval: (d) => d },
        showplayers_name: { refersto: 'showplayers_name', permissionreq: 'any', dataval: (d) => d },
        show_tooltip: { refersto: 'show_tooltip', permissionreq: 'any', dataval: (d) => d },
        sides: { refersto: 'sides', permissionreq: 'any', dataval: (d) => d },
        markers: { refersto: 'statusmarkers', permissionreq: 'any', dataval: (d) => d },
        statusmarkers: { refersto: 'statusmarkers', permissionreq: 'any', dataval: (d) => d },
        tint: { refersto: 'tint_color', permissionreq: 'any', dataval: (d) => d },
        tint_color: { refersto: 'tint_color', permissionreq: 'any', dataval: (d) => d },
        tooltip: { refersto: 'tooltip', permissionreq: 'any', dataval: (d) => d },
        top: { refersto: 'top', permissionreq: 'any', dataval: (d) => d },
        tracker: { refersto: 'tracker', permissionreq: 'any', dataval: (d) => d },
        tracker_offset: { refersto: 'tracker_offset', permissionreq: 'any', dataval: (d) => d },
        width: { refersto: 'width', permissionreq: 'any', dataval: (d) => d }
    };
    const charProps = {
        char_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        character_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        char_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        character_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        char_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        character_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        avatar: { refersto: 'avatar', permissionsreq: 'any', dataval: (d) => d },
        archived: { refersto: 'archived', permissionsreq: 'any', dataval: (d) => d },
        inplayerjournals: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => d },
        inplayerjournals_name: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        inplayerjournals_names: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        character_cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        char_cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        char_controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        character_controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        defaulttoken: { refersto: '_defaulttoken', permissionsreq: 'any', dataval: (d) => d }
    };
    const playerProps = { // $(player.player_color)
        player_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        player_name: { refersto: '_displayname', permissionsreq: 'any', dataval: (d) => d },
        displayname: { refersto: '_displayname', permissionsreq: 'any', dataval: (d) => d },
        display_name: { refersto: '_displayname', permissionsreq: 'any', dataval: (d) => d },
        player_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        color: { refersto: 'color', permissionsreq: 'any', dataval: (d) => d },
        lastpage: { refersto: '_lastpage', permissionsreq: 'any', dataval: (d) => d },
        last_page: { refersto: '_lastpage', permissionsreq: 'any', dataval: (d) => d },
        lastpagename: { refersto: '_lastpage', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        last_page_name: { refersto: '_lastpage', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        macrobar: { refersto: '_macrobar', permissionsreq: 'any', dataval: (d) => d },
        online: { refersto: '_online', permissionsreq: 'any', dataval: (d) => d },
        roll20id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        roll20_id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        r20id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        r20_id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        showmacrobar: { refersto: 'showmacrobar', permissionsreq: 'any', dataval: (d) => d },
        show_macrobar: { refersto: 'showmacrobar', permissionsreq: 'any', dataval: (d) => d },
        speakingas: { refersto: 'speakingas', permissionsreq: 'any', dataval: (d) => d },
        speaking_as: { refersto: 'speakingas', permissionsreq: 'any', dataval: (d) => d },
        userid: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        user_id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d }
    };
    const pageProps = { // @(page.pagename)
        page_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        page_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        page_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        adv_fow_enabled: { refersto: 'adv_fow_enabled', permissionsreq: 'any', dataval: (d) => d },
        adv_fow_dim_reveals: { refersto: 'adv_fow_dim_reveals', permissionsreq: 'any', dataval: (d) => d },
        adv_fow_show_grid: { refersto: 'adv_fow_show_grid', permissionsreq: 'any', dataval: (d) => d },
        archived: { refersto: 'archived', permissionsreq: 'any', dataval: (d) => d },
        background_color: { refersto: 'background_color', permissionsreq: 'any', dataval: (d) => d },
        bg_color: { refersto: 'background_color', permissionsreq: 'any', dataval: (d) => d },
        daylight_mode_enabled: { refersto: 'daylight_mode_enabled', permissionsreq: 'any', dataval: (d) => d },
        daylightmodeopacity: { refersto: 'daylightModeOpacity', permissionsreq: 'any', dataval: (d) => d },
        daylight_mode_opacity: { refersto: 'daylightModeOpacity', permissionsreq: 'any', dataval: (d) => d },
        diagonaltype: { refersto: 'diagonaltype', permissionsreq: 'any', dataval: (d) => d },
        diagonal_type: { refersto: 'diagonaltype', permissionsreq: 'any', dataval: (d) => d },
        diagonal: { refersto: 'diagonaltype', permissionsreq: 'any', dataval: (d) => d },
        dynamic_lighting_enabled: { refersto: 'dynamic_lighting_enabled', permissionsreq: 'any', dataval: (d) => d },
        explorer_mode: { refersto: 'explorer_mode', permissionsreq: 'any', dataval: (d) => d },
        fogopacity: { refersto: 'fog_opacity', permissionsreq: 'any', dataval: (d) => d },
        fog_opacity: { refersto: 'fog_opacity', permissionsreq: 'any', dataval: (d) => d },
        force_lighting_refresh: { refersto: 'force_lighting_refresh', permissionsreq: 'any', dataval: (d) => d },
        gridcolor: { refersto: 'gridcolor', permissionsreq: 'any', dataval: (d) => d },
        grid_color: { refersto: 'gridcolor', permissionsreq: 'any', dataval: (d) => d },
        grid_labels: { refersto: 'gridlabels', permissionsreq: 'any', dataval: (d) => d },
        gridlabels: { refersto: 'gridlabels', permissionsreq: 'any', dataval: (d) => d },
        gridopacity: { refersto: 'grid_opacity', permissionsreq: 'any', dataval: (d) => d },
        grid_opacity: { refersto: 'grid_opacity', permissionsreq: 'any', dataval: (d) => d },
        gridtype: { refersto: 'grid_type', permissionsreq: 'any', dataval: (d) => d },
        grid_type: { refersto: 'grid_type', permissionsreq: 'any', dataval: (d) => d },
        height: { refersto: 'height', permissionsreq: 'any', dataval: (d) => d },
        jukeboxtrigger: { refersto: 'jukeboxtrigger', permissionsreq: 'any', dataval: (d) => d },
        jukebox_trigger: { refersto: 'jukeboxtrigger', permissionsreq: 'any', dataval: (d) => d },
        lightupdatedrop: { refersto: 'lightupdatedrop', permissionsreq: 'any', dataval: (d) => d },
        lightenforcelos: { refersto: 'lightenforcelos', permissionsreq: 'any', dataval: (d) => d },
        lightrestrictmove: { refersto: 'lightrestrictmove', permissionsreq: 'any', dataval: (d) => d },
        lightglobalillum: { refersto: 'lightglobalillum', permissionsreq: 'any', dataval: (d) => d },
        scale_number: { refersto: 'scale_number', permissionsreq: 'any', dataval: (d) => d },
        scale_units: { refersto: 'scale_units', permissionsreq: 'any', dataval: (d) => d },
        showdarkness: { refersto: 'showdarkness', permissionsreq: 'any', dataval: (d) => d },
        show_darkness: { refersto: 'showdarkness', permissionsreq: 'any', dataval: (d) => d },
        showgrid: { refersto: 'showgrid', permissionsreq: 'any', dataval: (d) => d },
        show_grid: { refersto: 'showgrid', permissionsreq: 'any', dataval: (d) => d },
        showlighting: { refersto: 'showlighting', permissionsreq: 'any', dataval: (d) => d },
        show_lighting: { refersto: 'showlighting', permissionsreq: 'any', dataval: (d) => d },
        snapping_increment: { refersto: 'snapping_increment', permissionsreq: 'any', dataval: (d) => d },
        width: { refersto: 'width', permissionsreq: 'any', dataval: (d) => d },
        zorder: { refersto: '_zorder', permissionsreq: 'any', dataval: (d) => d }
    };
    const campaignProps = { // @(campaign.prop)
        campaign_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        campaign_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        turnorder: { refersto: 'turnorder', permissionsreq: 'any', dataval: (d) => d },
        initiativepage: { refersto: 'initiativepage', permissionsreq: 'any', dataval: (d) => d },
        pageid: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => d },
        page_id: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => d },
        playerpageid: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => d },
        playerpage_id: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => d },
        pagename: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        page_name: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        playerpagename: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        playerpage_name: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        playerspecificpages: { refersto: 'playerspecificpages', permissionsreq: 'any', dataval: (d) => d },
        journalfolder: { refersto: '_journalfolder', permissionsreq: 'any', dataval: (d) => d },
        jukeboxfolder: { refersto: '_jukeboxfolder', permissionsreq: 'any', dataval: (d) => d },
        jukeboxplaylistplaying: { refersto: '_jukeboxplaylistplaying', permissionsreq: 'any', dataval: (d) => d },
        token_markers: { refersto: '_token_markers', permissionsreq: 'any', dataval: (d) => d },
        markers: { refersto: '_token_markers', permissionsreq: 'any', dataval: (d) => d }

    };
    const markerProps = { // derived from the Campaign object
        marker_id: { refersto: 'tag', permissionsreq: 'any', dataval: (d) => d },
        marker_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        tag: { refersto: 'tag', permissionsreq: 'any', dataval: (d) => d },
        url: { refersto: 'url', permissionsreq: 'any', dataval: (d) => d },
        html: { refersto: 'html', permissionsreq: 'any', dataval: (d) => d }
    };
    const statusProps = { // derived from a Token object
        status_id: { refersto: 'tag', permissionsreq: 'any', dataval: (d) => d },
        status_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        num: { refersto: 'num', permissionsreq: 'any', dataval: (d) => d },
        number: { refersto: 'num', permissionsreq: 'any', dataval: (d) => d },
        value: { refersto: 'num', permissionsreq: 'any', dataval: (d) => d },
        val: { refersto: 'num', permissionsreq: 'any', dataval: (d) => d },
        html: { refersto: 'html', permissionsreq: 'any', dataval: (d) => d },
        tag: { refersto: 'tag', permissionsreq: 'any', dataval: (d) => d },
        url: { refersto: 'url', permissionsreq: 'any', dataval: (d) => d },
        is: { refersto: 'is', permissionsreq: 'any', dataval: (d) => d },
        count: { refersto: 'count', permissionsreq: 'any', dataval: (d) => d }
    };

    const condensereturn = (funcret, status, notes) => {
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        if (status.length) {
            funcret.status = status.reduce((m, v) => {
                switch (m) {
                    case 'unchanged':
                        m = v;
                        break;
                    case 'changed':
                        m = v === 'unresolved' ? v : m;
                        break;
                    case 'unresolved':
                        break;
                }
                return m;
            });
        }
        funcret.notes = notes.join('<br>');
        return funcret;
    };

    const trackerrx = /^tracker(\[(?<filter>[^\]]+)]){0,1}((?<operator>\+|-)(?<offset>\d+)){0,1}$/i;
    const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.]\[\s*(?<pattern>.+?)\s*]\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const macrorx = /#\((?<item>[^\s.[)]+?)(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const multirx = /(?<type>(?:@|%))\((?<obj>tracker(?:\[[^\]]+]){0,1}(?:(?:\+|-)\d+){0,1}|[^@*%#|.]+?)[|.](?<prop>[^@*%#\s.[|]+?)(?:[|.](?<identikey>[^@*%#.|[]+?)(?:[|.](?<subprop>[^[@*%#]+?)){0,1}){0,1}(?:\[(?<default>[^@*%#\]]*?)]){0,1}\s*\)/gi;

    const testConstructs = c => {
        return [multirx, rptgitemrx, macrorx].reduce((m, r) => {
            m = m || r.test(c);
            r.lastIndex = 0;
            return m;
        }, false);
    };
    const simpleObj = (o) => typeof o !== 'undefined' ? JSON.parse(JSON.stringify(o)) : o;

    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        let msgId = generateUUID();

        const filterObj = {
            'page': (t) => t._pageid === (Campaign().get('playerspecificpages')[msg.playerid] || Campaign().get('playerpageid')),
            'ribbon': (t) => t._pageid === Campaign().get('playerpageid'),
            'gm': (t) => true
        };
        const propContainers = {
            token: tokenProps,
            character: charProps,
            player: playerProps,
            page: pageProps,
            campaign: campaignProps,
            marker: markerProps,
            player: playerProps,
            status: statusProps
        };
        const getPropertyValue = (source, objtype, item, def = '') => {
            let propObj = propContainers[objtype.toLowerCase()];
            let retval = def;
            if (!source) {
                notes.push(`Unable to find a source for property named ${item}. Using default value.`);
            } else if (!Object.keys(propObj).includes(item.toLowerCase())) {
                notes.push(`Unable to find a ${objtype.toLowerCase()} property named ${item}. Using default value.`);
            } else {
                retval = propObj[item.toLowerCase()].dataval(source[propObj[item.toLowerCase()].refersto]);
                if (typeof retval === 'undefined') {
                    notes.push(`Unable to find ${objtype.toLowerCase()} value for ${item}. Using default value.`);
                    retval = def;
                }
            }
            return retval;
        };
        const getCharacterAttribute = (source, type, prop, valtype, def = '') => {
            let retval = def;
            if (!source) {
                notes.push(`Unable to find a character with the given criteria. Using default value.`);
            } else {
                retval = getSheetItemVal({ groups: { type: type, character: source.id, item: prop, valtype: valtype } }, msg.playerid, source);
                if (typeof retval === 'undefined') {
                    notes.push(`Unable to find ${type === '@' ? 'attribute' : 'ability'} named ${prop} for ${source.name}. Using default value.`);
                    retval = def;
                }
            }
            return retval;
        };
        while (testConstructs(msg.content)) {
            msg.content = msg.content.replace(multirx, (m, type, obj, prop, identikey, subprop, def = '') => {
                let offset = 0,
                    trackres,
                    pgfilter = 'page',
                    presource,
                    source,
                    retval = def,
                    reverse = false,
                    to;
                if (trackerrx.test(obj)) { // if it is a tracker call, it could have an offset, so we detect that first
                    trackres = trackerrx.exec(obj);
                    offset = parseInt(trackres.groups.offset || '0');
                    if (trackres.groups.operator === '-') reverse = true;
                    if (playerIsGM(msg.playerid)) pgfilter = trackres.groups.filter || 'page';
                    obj = `tracker`;
                    trackres.lastIndex = 0;
                }
                if (obj.toLowerCase() === 'speaker') { // if it's a speaker call, determine if player or character, and adjust appropriately
                    presource = simpleObj(getChar(msg.who, msg.playerid));
                    if (presource && presource.name) {
                        obj = presource.name;
                    } else {
                        presource = simpleObj(getPlayer(msg.who));
                        if (presource && presource._displayname) {
                            obj = 'player';
                            subprop = identikey;
                            identikey = prop;
                            prop = presource._displayname;
                        } else {
                            notes.push(`Unable to find the speaker`);
                        }
                    }
                }
                switch (obj.toLowerCase()) {
                    case 'player':
                        source = simpleObj(getPlayer(prop));
                        retval = getPropertyValue(source, obj, identikey, def);
                        break;
                    case 'page':
                        source = simpleObj(getPage(prop));
                        retval = getPropertyValue(source, obj, identikey, def);
                        break;
                    case 'marker':
                        source = simpleObj(getMarker(prop));
                        retval = getPropertyValue(source, obj, identikey, def);
                        break;
                    case 'campaign':
                        source = simpleObj(Campaign());
                        retval = getPropertyValue(source, obj, prop, def);
                        break;
                    case 'selected':
                        if (!msg.selected) { // selected but no token => default
                            notes.push(`No token selected for ${m}. Using default value.`);
                            retval = def;
                        } else {
                            if (Object.keys(tokenProps).includes(prop.toLowerCase())) { // selected with token prop
                                source = simpleObj(getToken(msg.selected[0]._id));
                                retval = getPropertyValue(source, 'token', prop, def);
                            } else if (prop.toLowerCase() === 'status') { // selected with status
                                if (identikey &&
                                    getMarker(/(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(identikey.toLowerCase())[1]).name &&
                                    Object.keys(statusProps).includes((subprop || 'value').toLowerCase())) {
                                    presource = simpleObj(getToken(msg.selected[0]._id));
                                    if (!tokenStatuses.hasOwnProperty(presource.id) || tokenStatuses[presource.id].msgId !== msgId) {
                                        tokenStatuses[presource.id] = new StatusBlock({ token: presource, msgId: msgId });
                                    }
                                    source = getStatus(msg.selected[0]._id, identikey, msgId);
                                    retval = getPropertyValue(source, prop, (subprop || 'value'), def);
                                }
                            } else { // selected with character prop/attribute/ability
                                source = simpleObj(getChar(msg.selected[0]._id, msg.playerid));
                                if (Object.keys(charProps).includes(prop.toLowerCase())) { // selected + character prop
                                    retval = getPropertyValue(simpleObj(source), 'character', prop, def);
                                } else { // selected + character attribute or ability
                                    retval = getCharacterAttribute(source, type, prop, identikey, def);
                                }
                            }
                        }

                        break;
                    case 'tracker':
                        to = JSON.parse(Campaign().get('turnorder') || '[]').filter(filterObj[pgfilter] || filterObj['page']);
                        if (!to.length || to[0].id === '-1') {
                            notes.push(`No tracker token for ${m}. Using default value.`);
                            retval = def;
                        } else {
                            presource = to[(reverse ? to.length - (offset % to.length) : offset % to.length) % to.length];
                            if (Object.keys(tokenProps).includes(prop.toLowerCase())) {                   // tracker + token property
                                source = simpleObj(getToken(presource.id, presource._pageid));
                                retval = getPropertyValue(source, 'token', prop, def);
                            } else if (prop.toLowerCase() === 'status') { // tracker with status
                                if (identikey &&
                                    getMarker(/(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(identikey.toLowerCase())[1]).name &&
                                    Object.keys(statusProps).includes((subprop || 'value').toLowerCase())) {
                                    presource = simpleObj(getToken(presource.id, presource._pageid));
                                    if (presource && !presource.hasOwnProperty('id')) presource.id = presource._id;
                                    if (!tokenStatuses.hasOwnProperty(presource.id) || tokenStatuses[presource.id].msgId !== msgId) {
                                        tokenStatuses[presource.id] = new StatusBlock({ token: presource, msgId: msgId });
                                    }
                                    source = getStatus(presource.id, identikey, msgId);
                                    retval = getPropertyValue(source, prop, (subprop || 'value'), def);
                                }
                            } else {                                                        // tracker with character prop/attribute/ability
                                source = simpleObj(getChar(presource.id, msg.playerid));
                                if (Object.keys(charProps).includes(prop.toLowerCase())) {  // tracker + character prop
                                    retval = getPropertyValue(simpleObj(source), 'character', prop, def);
                                } else {  //tracker + character attribute/ability
                                    retval = getCharacterAttribute(source, type, prop, identikey, def);
                                }
                            }
                        }
                        break;
                    default: // all others -- could be token name, token id, character name, or character id
                        if (Object.keys(tokenProps).includes(prop.toLowerCase())) {        // token property
                            source = simpleObj(getToken(obj, getPageID(msg.playerid)));
                            retval = getPropertyValue(source, 'token', prop, def);
                        } else { // character property or attribute or ability
                            source = simpleObj(getChar(obj, msg.playerid) || getChar((simpleObj(getToken(obj, getPageID(msg.playerid))) || {}).represents, msg.playerid));
                            if (Object.keys(charProps).includes(prop.toLowerCase())) { // character property
                                retval = getPropertyValue(simpleObj(source), 'character', prop, def);
                            } else {                                                  // character attribute/ability
                                retval = getCharacterAttribute(source, type, prop, identikey, def);
                            }
                        }
                        break;
                }
                status.push('changed');
                return retval;
            });

            // REPEATING SHEET ITEMS
            msg.content = msg.content.replace(rptgitemrx, (m, type, obj, section, pattern, valuesuffix, valtype, def = '') => {
                let bsel = false;
                let offset = 0,
                    trackres,
                    pgfilter = 'page',
                    presource,
                    source,
                    retval,
                    reverse = false,
                    to;
                if (trackerrx.test(obj)) { // if it is a tracker call, it could have an offset, so we detect that first
                    trackres = trackerrx.exec(obj);
                    offset = parseInt(trackres.groups.offset || '0');
                    if (trackres.groups.operator === '-') reverse = true;
                    if (playerIsGM(msg.playerid)) pgfilter = trackres.groups.filter || 'page';
                    obj = `tracker`;
                    trackres.lastIndex = 0;
                }
                switch (obj.toLowerCase()) {
                    case 'selected':
                        if (!msg.selected) {
                            notes.push(`No token selected for ${m}. Using default value.`);
                            bsel = true;
                            retval = def;
                        } else {
                            source = getChar(msg.selected[0]._id, msg.playerid);
                        }
                        break;
                    case 'speaker':
                        source = getChar(msg.who, msg.playerid);
                        break;
                    case 'tracker':
                        to = JSON.parse(Campaign().get('turnorder') || '[]').filter(filterObj[pgfilter] || filterObj['page']);
                        if (!to.length || to[0].id === '-1') {
                            notes.push(`No tracker token for ${m}. Using default value.`);
                            retval = def;
                        } else {
                            presource = to[(reverse ? to.length - (offset % to.length) : offset % to.length) % to.length];
                            if (presource && !presource.hasOwnProperty('id')) presource.id = presource._id;
                            source = simpleObj(getChar(presource.id, msg.playerid));
                        }
                        break;
                    default:
                        source = getChar(obj, msg.playerid);
                }

                if (!source) {
                    if (!bsel) notes.push(`Unable to find character for ${m}. Using default value.`); //track note only if we haven't already tracked no selected
                    retval = def;
                } else {
                    retval = getSheetItemVal({ groups: { type: type, character: source.id, valtype: valtype, section: section, pattern: pattern, valuesuffix: valuesuffix } }, msg.playerid, source);
                    if (typeof retval === 'undefined') {
                        notes.push(`Unable to find repeating item for ${m}. Using default value.`);
                        retval = def;
                    }
                }
                if (retval) status.push('changed');
                return retval;
            });

            // MACROS
            msg.content = msg.content.replace(macrorx, (m, item, def = '') => {
                let retval = def;
                let locobj = findObjs({ type: 'macro', name: item })[0];
                const validator = e => ['all', msg.playerid].includes(e);
                if (!locobj || !(msg.playerid === locobj.get('_playerid') || locobj.get('visibleto').split(',').some(validator))) {
                    status.push('unresolved');
                    notes.push(`Unable to find macro named ${item}. Using default value.`);
                    return retval;
                }
                retval = locobj.get('action') || '';
                status.push('changed');
                return retval;
            });
        }
        return condensereturn(funcret, status, notes);
    };


    let scriptisplugin = false;
    const fetch = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();

        if ('undefined' === typeof libTokenMarkers
            || (['getStatus', 'getStatuses', 'getOrderedList'].find(k =>
                !libTokenMarkers.hasOwnProperty(k) || 'function' !== typeof libTokenMarkers[k]
            ))
        ) {
            // blow up
            let msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="https://i.imgur.com/jeIkjvS.png"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;"><span style="font-weight: bold">Fetch</span> requires <code>libTokenMarkers</code>.  Please install it from the 1-click Mod Library.</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat('TestScript', `/w gm ${msg}`);
            return;
        }

        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(fetch);
        }
    });
    return {
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Fetch.offset); } }
