/*
=========================================================
Name			:	Inspector
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	0.0.b1
Last Update		:	10/18/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Inspector = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Inspector.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}
const Inspector = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'Inspector';
    const apilogo = `https://i.imgur.com/N9swrPX.png`; // black for light backgrounds
    const apilogoalt = `https://i.imgur.com/xFOQhK5.png`; // white for dark backgrounds
    const version = '0.0.b1';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1666126147698);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
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
    // ==================================================
    //		STATE MANAGEMENT
    // ==================================================
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) { // eslint-disable-line no-prototype-builtins
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {
                            playersCanIDs: false,
                            playersCanUse: false
                        },
                        defaults: {
                            playersCanIDs: false,
                            playersCanUse: false
                        },
                        version: schemaVersion
                    }
                    break;
            }
        }
    };
    let stateReady = false;
    const assureState = () => {
        if (!stateReady) {
            checkInstall();
            stateReady = true;
        }
    };
    const manageState = { // eslint-disable-line no-unused-vars
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        clone: () => { return _.clone(state[apiproject].settings); },
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
    };
    const propSanitation = (p, v) => {
        const propTypes = {
            'playersCanIDs': (p, v) => validateBoolean(p, v),
            'playersCanUse': (p, v) => validateBoolean(p, v)
        };
        const validateBoolean = (p, v) => {
            return { prop: p, val: ['true', 't', 'yes', 'y', 'yup', '+', 'keith'].includes(v) };
        };

        return Object.keys(propTypes).reduce((m, k) => {
            if (m) return m;
            if (k.toLowerCase() === p.toLowerCase()) return propTypes[k](k, v);
        }, undefined);

    };
    // ==================================================
    //		PRESENTATION
    // ==================================================
    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { };
    const syntaxHighlight = (obj, replacer = undefined, msgobj = {}) => {
        const css = {
            stringstyle: 'darkcyan;',
            numberstyle: 'magenta;',
            booleanstyle: 'orangered;',
            nullstyle: 'darkred;',
            keystyle: 'black;'
        };
        let pid = msgobj.playerid;
        let str = '';
        if (typeof obj !== 'string') {
            str = JSON.stringify(obj, replacer, '   ');
            obj = simpleObj(obj);
        } else {
            str = obj;
            obj = JSON.parse(obj);
        }
        str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        let olinkrx = new RegExp(`(${getAllObjs().map(o => o.id).join('|')})`, 'g');
        return str.replace(/\\n(?<!\\\\n)/g, msgobj.aboutUUID).replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
            let cls = 'numberstyle';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'keystyle';
                } else {
                    cls = 'stringstyle';
                }
            } else if (/true|false/.test(match)) {
                cls = 'booleanstyle';
            } else if (/null/.test(match)) {
                cls = 'nullstyle';
            }
            let content = match.replace(/^"(.*)"(:?)$/g, ((m, g1, g2) => `${g1}${g2}`)).replace(/\\(.)/g, `$1`);
            content = HE(content)
                .replace(/(#[0-9A-Fa-f]{6})|(#[0-9A-Fa-f]{3})|(#[0-9A-Fa-f]{6}\d{2})/gi, m => getTipForColor(m))
                .replace(olinkrx, (m, g1) => {
                    let b = Messenger.Button({ type: '!', elem: `!about --${g1}`, label: 's', css: localCSS.inlineLink });
                    let o = fuzzyGet(g1, pid, undefined, true);
                    let idTip = '';
                    if (o && o.obj && o.obj.length) {
                        o = o.obj[0];
                        idTip = getTipFromObjForID(o);
                    } else {
                        o = undefined;
                    }
                    idTip = getTipFromObjForID(o);
                    return idTip ? idTip.replace(`${g1}</span>`, `${g1}${b}</span>`) : `<span style="display: inline-block">${g1}${b}</span>`;
                });
            return `<span style="color:${css[cls]}">${content}</span>`;
        })
            .replace(/gmnotes:<\/span>/, () => {
                if (obj && obj.gmnotes && obj.gmnotes.length) {
                    return `${getTip(decodeURIComponent(obj.gmnotes), 'gmnotes','GM Notes')}</span>`;
                    }
            })
            .replace(new RegExp(msgobj.aboutUUID, 'g'), '<br>');
    };
    const showObjInfo = ({
        o: o = '',
        title: title = 'PARSED OBJECT',
        replacer: replacer = undefined,
        sendas: sendas = "API",
        whisperto: whisperto = "",
        headercss: headercss = {},
        bodycss: bodycss = {},
        msgobj: msgobj = {}
    } = {}) => {
        msgbox({
            title: title,
            msg: html.pre(syntaxHighlight(o || '', replacer, msgobj).replace(/\n/g, '<br>')),
            sendas: sendas,
            whisperto: whisperto,
            headercss: headercss,
            bodycss: bodycss
        });
        return;
    };
    const theme = {
        primaryColor: '#222d3a',
        primaryLightColor: '#ededed',
        baseTextColor: '#232323',
        secondaryColor: '#82b9b9'
    };
    let localCSS = {
        msgbody: {
            'background-color': theme.primaryLightColor,
            'color': '#232323'
        },
        msgheader: {
            'background-color': theme.primaryColor,
            'color': theme.primaryLightColor,
            'font-size': '1.2em'
        },
        msgheadercontent: {
            'display': 'inline-block'
        },
        msgheaderlogodiv: {
            'display': 'inline-block',
            'max-height': '30px',
            'margin-right': '8px',
            'margin-top': '4px'
        },
        logoimg: {
            'background-color': 'transparent',
            'float': 'left',
            'border': 'none',
            'max-height': '30px'
        },
        infoheader: {
            'background-color': theme.primaryColor,
            'color': theme.primaryLightColor,
            'font-size': '1.2em'
        },
        infobody: {
            'background-color': theme.primaryLightColor,
            'color': theme.baseTextColor
        },
        buttoncss: {
            'padding': '4px 8px',
            'background-color': theme.primaryColor,
            'color': theme.primaryLightColor,
            'border-radius': '5px',
            'line-height': '12px',
            'font-size': '12px'
        },
        inlineLink: {
            'background-color': theme.secondaryColor,
            'color': theme.primaryLightColor,
            'padding': '1px 1px 2px 3px',
            'border-radius': '5px',
            'margin': '0px 1px 0px 3px',
            'line-height': '.95em',
            'font-family': 'pictos'
        },
        tipContainer: {
            'overflow': 'hidden',
            'width': '100%',
            'border': 'none',
            'max-width': '250px',
            'display': 'block'
        },
        tipBounding: {
            'border-radius': '10px',
            'border': '2px solid #000000',
            'display': 'table-cell',
            'width': '100%',
            'overflow': 'hidden',
            'font-size': '12px'
        },
        tipHeaderLine: {
            //'background-image': 'linear-gradient(to right, #222d3a 40px, #ededed 40px)',
            //'background-repeat': 'no-repeat',
            //'background-size': 'auto',
            'overflow': 'hidden',
            'display': 'table',
            'background-color': theme.primaryColor,
            'width': '100%'
        },
        tipLogoSpan: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'vertical-align': 'middle',
            'width': '40px'
        },
        tipLogoImg: {
            'min-height': '40px',
            'margin-left': '3px',
            'background-image': `url('${apilogoalt}')`,
            'background-repeat': 'no-repeat',
            'backgound-size': 'contain',
            'width': '37px',
            'display': 'inline-block'
        },
        tipContentLine: {
            'overflow': 'hidden',
            'display': 'table',
            'background-color': theme.primaryLightColor,
            'width': '100%'
        },
        tipContent: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'padding': '5px 8px',
            'text-align': 'left',
            'color': '#232323',
            'background-color': theme.primaryLightColor
        },
        tipHeaderTitle: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'padding': '5px 8px',
            'text-align': 'left',
            'color': theme.primaryLightColor,
            'font-size': '1.2em',
            'vertical-align': 'middle',
            'font-weight': 'bold'
        }
    };
    const getTipFromObjForID = (obj) => {
        o = simpleObj(obj);
        let contents = validTypes[o._type](o);
        let tipHeader = contents.header || 'Info';
        let formattedContent = Object.keys(contents).filter(k => !['header','id'].includes(k.toLowerCase())).map(k => `&bull; <span style="font-weight:bold">${k}</span>: ${contents[k]}`).join('<br>');
        return getTip(formattedContent, contents.ID, tipHeader);
    };
    const getTipForColor = (color) => {
        const localCSS = {
            colorTip: {
                'width': '100%',
                'height': '50px',
                'min-height': '50px',
                'display': 'inline-block',
                'border': '0',
                'padding': '0',
                'margin': '0 auto',
                'vertical-align': 'middle',
                'background-color': color,

            }
        };
        let content = html.span('', localCSS.colorTip);
        return getTip(content, color, color);
    };
    const getTip = (contents, label, header = 'Info') => {
        return html.tip(
            label,
            { 'display': 'inline-block' },
            html.span( // container
                html.span( // bounding
                    html.span( // header line
                        html.span( // left (logo)
                            html.span('', localCSS.tipLogoImg),
                            localCSS.tipLogoSpan) +
                        html.span( // right (content)
                            header,
                            localCSS.tipHeaderTitle),
                        localCSS.tipHeaderLine) + 
                    html.span( // content line
                        html.span( // content cell
                            contents,
                            localCSS.tipContent),
                        localCSS.tipContentLine),
                    localCSS.tipBounding),
                localCSS.tipContainer)
        );
    };
    // ==================================================
    //		UTILITIES
    // ==================================================
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
    const simpleObj = (o) => typeof o !== 'undefined' ? JSON.parse(JSON.stringify(o)) : o;
    const validTypes = {
        'graphic': (o) => {
            return {
                header: (o._subtype || o._type).toUpperCase(),
                ID: o._id,
                Name: o.name,
                Page: (getObj('page', o._pageid) || { get: () => o._pageid || 'Unknown' }).get('name'),
                Layer: o.layer,
                Position: `(${Math.round(o.left)}, ${Math.round(o.top)})`,
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p }).get('displayname')).join(', '),
            };
        },
        'character': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Journals: o.inplayerjournals.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
            };
        },
        'attribute': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Character: (getObj('character', o._characterid) || { get: () => o._characterid || 'Unknown' }).get('name'),
                Current: o.current,
                Max: o.max
            }
        },
        'ability': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Character: (getObj('character', o._characterid) || { get: () => o._characterid || 'Unknown' }).get('name'),
            }
        },
        'macro': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Visible: o.visibleto.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
                Creator: (getObj('player', o._playerid) || { get: () => o._playerid || 'Unknown' }).get('displayname')
            }
        },
        'handout': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Journals: o.inplayerjournals.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
            }
        },
        'rollabletable': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name
            }
        },
        'page': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Height: o.height,
                Width: o.width
            }
        },
        'deck': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name
            }
        },
        'card': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Deck: (getObj('deck', o._deckid) || { get: () => o._deckid || 'Unknown' }).get('name')
            }
        },
        'hand': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Player: (getObj('player', o._parentid) || { get: () => o._parentid || 'Unknown' }).get('displayname'),

            }
        }, 
        'jukeboxtrack': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Title: o.title,
                Volume: o.volume,
                Loop: o.loop
            }
        },
        'custfx': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name
            }
        },
        'path': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Page: (getObj('page', o._pageid) || { get: () => o._pageid || 'Unknown' }).get('name'),
                Layer: o.layer,
                Position: `(${Math.round(o.left)}, ${Math.round(o.top)})`,
                Type: o.barrierType,
                OneWay: o.oneWayReversed,
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),

            }
        },
        'text': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Page: (getObj('page', o._pageid) || { get: () => o._pageid || 'Unknown' }).get('name'),
                Layer: o.layer,
                Position: `(${Math.round(o.left)}, ${Math.round(o.top)})`,
                Text: o.text || '',
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
            }
        },
        'player': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                DisplayName: o._displayname,
                Page: (getObj('page', o._lastpage) || { get: () => o._lastpage || 'Unknown' }).get('name')
            }
        },
        'campaign': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Page: (getObj('page', o.playerpageid) || { get: () => o.playerpageid || 'Unknown' }).get('name'),
                Others: Object.keys(o.playerspecificpages).map(k => `<span style="display:inline-block;">${(getObj('player', k) || { get: () => k || 'Unknown' }).get('displayname') } (${(getObj('page', o.playerspecificpages[k]) || { get: () => o.o.playerspecificpages[k] || 'Unknown' }).get('name') })</span>`)
            }
        }

    };
    const fuzzyGet = (query, pid, msg, onlyfirst = true) => {
        let ret;
        let res;
        const validProps = ['name', 'title', 'text', 'displayname'];
        const types = Object.keys(validTypes);
        const canIds = playerIsGM(pid) || manageState.get('playersCanIDs');
        if (canIds) validProps.unshift('id');
        if (/state(\.|$)/i.test(query)) {
            if (!canIds) return { fail: true, reason: 'canids' };
            ret = query.split('.').slice(1).reduce((m, k) => {
                if (m) m = m[k];
                return m;
            }, state);
            if (ret) ret = { name: query, obj: [ret] };
        } else if (/(msg|message)/i.test(query)) {
            ret = { name: 'Message', obj: [msg] };
        } else if (/^(inline|inlinerolls?|rolls)/i.test(query)) {
            ret = { name: 'Rolls', obj: [msg.inlinerolls] };
        } else if (/selected/i.test(query)) {
            ret = { name: 'Selected', obj: [msg.selected] };
        } else if (/^\$\[\[(\d+)]]/.test(query)) {
            res = /^\$\[\[(\d+)]]/.exec(query);
            ret = msg.inlinerolls && msg.inlinerolls.length > res[1] ? msg.inlinerolls[res[1]] : undefined;
            if (ret) ret = { name: `Roll ${res[1]} (${msg.inlinerolls[res[1]].expression})`, obj: [ret] };
        } else if (/^type\s+([^\s]+.*)/g.test(query)) {
            res = /^type\s+([^\s]+.*)/g.exec(query)[1]
                .split(/\s+/)
                .map(t => t.toLowerCase())
                .filter(t => types.includes(t))
                .map(t => findObjs({ type: t }))
                .reduce((m, t) => [...m, ...t], []);
            if (res.length) {
                ret = { name: 'By Type', obj: res, bytype: {} };
                res.reduce((m, o) => {
                    let type = o.get('type');
                    m[type] = m[type] || [];
                    m[type].push(o);
                    return m;
                }, ret.bytype);
            }
        }

        while (validProps.length) {
            if (onlyfirst && ret) break;
            const prop = validProps.shift();
            res = findObjs({ [prop]: query });
            if (res.length) {
                if (!ret) ret = { name: query, obj: res, bytype: {} };
                else ret.obj = [...ret.obj, ...res];
            }
            if (ret && !onlyfirst) {
                res.reduce((m, o) => {
                    let type = o.get('type');
                    m[type] = m[type] || [];
                    m[type].push(o);
                    return m;
                }, ret.bytype);
            }
        }
        return ret || { fail: true, reason: 'notfound' };
    };
    const failHandler = (wto, altmsg = 'default') => {
        const messages = {
            canids: 'You must be a GM or have your GM enable the playerCanIds setting for Inspector to use this feature.',
            notfound: 'Unable to find an object using the parameters supplied. Please try again.',
            default: 'You must be a GM or have your GM enable the playersCanUse setting for Inspector to use this feature.'
        };
        messages.notfoundid = `${messages.notfound} If you were searching by ID, it is possible that the object exists, but Inspector is not currently configured to allow players to use IDs. Your GM can enable this feature, if needed.`
        altmsg = Object.keys(messages).map(k => k.toLowerCase()).includes(altmsg.toLowerCase()) ? altmsg.toLowerCase() : 'default';
        msgbox({ msg: messages[altmsg], title: 'Inspection Failed', whisperto: wto });
    };
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        sendas: sendas = 'MSG',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss });
    };
    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const apihandles = {
        about: /^!about\b/i,
        aboutfirst: /^!aboutfirst\b/i,
        aboutconfig: /^!aboutconfig\b/i
    };
    const testConstructs = (c) => {
        return Object.keys(apihandles).reduce((m, k) => {
            if (!m.length) m = m || apihandles[k].test(c) ? k : '';
            apihandles[k].lastIndex = 0;
            return m;
        }, '');
    };
    const handleInput = (msg) => {
        if (!msg.type === 'api' || !testConstructs(msg.content).length) return;
        let wto = msg.who.replace(/\s\(gm\)$/i, '');
        if (!(playerIsGM(msg.playerid) || manageState.get('playersCanUse'))) {
            failHandler(wto);
            return;
        }
        let args = msg.content.split(/\s+--/g);
        let o;
        let table = '', rows = '';
        msg.aboutUUID = `About${generateUUID()}`;
        switch (testConstructs(msg.content)) {
            case 'aboutfirst':
                args.slice(1).forEach(a => {
                    o = simpleObj(fuzzyGet(a, msg.playerid, msg));
                    if (!o || o.fail) failHandler(wto, (o || { reason: `notfound${!manageState.get('playersCanIDs') && !playerIsGM(msg.playerid) ? 'id' : ''}` }).reason);
                    else if (o) showObjInfo({ o: o.obj[0], title: o.name, sendas: `MSG`, whisperto: wto, headercss: localCSS.infoheader, bodycss: localCSS.infobody, msgobj: msg });
                    else msgbox({ msg: `No object found for ${a}.${!manageState.get('playersCanIDs') && !playerIsGM(msg.playerid) ? ' If you were searching by ID, it is possible that the object exists, but Inspector is not currently configured to allow players to use IDs. Your GM can enable this feature, if needed.' : ''}`, title: `No Object Found`, whisperto: wto });
                });
                break;
            case 'about':
                args.slice(1).forEach(a => {
                    o = fuzzyGet(a, msg.playerid, msg, false)
                    if (!o || o.fail) failHandler(wto, (o || { reason: `notfound${!manageState.get('playersCanIDs') && !playerIsGM(msg.playerid) ? 'id' : ''}` }).reason);
                    else if (o && o.obj && o.obj.length === 1) showObjInfo({ o: o.obj[0], title: o.name, sendas: `MSG`, whisperto: wto, headercss: localCSS.infoheader, bodycss: localCSS.infobody, msgobj: msg });
                    else {
                        rows = Object.keys(o.bytype).map(k => {
                            return html.tr(html.td(k.toUpperCase()) + html.td('', { width: '50px' }), { 'border-bottom': '1px solid #222d3a', 'font-size': '14px', 'font-weight': 'bold' }) + o.bytype[k].map(item => {
                                return `${html.tr(html.td(getTipFromObjForID(item)) + html.td(Messenger.Button({ type: '!', elem: '!aboutfirst --' + item.id, label: 'View', css: localCSS.buttoncss }), { width: '50px' }))}`;
                            }).join('');
                        }).join('');
                        table = html.table(rows, { width: '100%' });
                        msgbox({ msg: table, title: o.name, whisperto: wto });
                    }
                });
                break;
            case 'aboutconfig':
                if (!playerIsGM(msg.playerid)) {
                    failHandler(wto, 'canids');
                    return;
                }
                o = {};
                args.slice(1).forEach(a => {
                    if (!/([^\s=/]+)\s*=\s*(.*)/.test(a)) return;
                    let [_m, prop, val] = /([^\s=/]+)\s*=\s*(.*)/.exec(a); // eslint-disable-line no-unused-vars
                    let sanisetting = propSanitation(prop, val);
                    if (sanisetting) {
                        o[sanisetting.prop] = sanisetting.val;
                        manageState.set(sanisetting.prop, sanisetting.val);
                    }
                });
                if (Object.keys(o).length) {
                    msgbox({
                        title: 'Settings Changed',
                        whisperto: wto,
                        msg: `You made the following changes to Inspector:<br>${Object.keys(o).map(k => `&bull; <b>${k}</b> : ${o[k]}`).join('<br>')}`
                    });
                }
                break;
            default:
                return;
        }

    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);

    };

    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            let result = { passed: true, failures: {} };
            deps.forEach(d => {
                if (!d.mod) {
                    result.passed = false;
                    result.failures[d.name] = `Not found.`;
                    return;
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) { // eslint-disable-line no-prototype-builtins
                        m.passed = false;
                        m.failures[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        if (!depCheck.passed) {
            let failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            let contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            let msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };

    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
        let reqs = [
            { name: 'Messenger', mod: typeof Messenger !== 'undefined' ? Messenger : undefined, checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function']] }
        ];
        if (!checkDependencies(reqs)) return;
        html = Messenger.Html();
        css = Messenger.Css();
        HE = Messenger.HE;
        registerEventHandlers();
    });
    return {};
})();