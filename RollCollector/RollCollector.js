/*
=========================================================
Name			:	RollCollector
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	1.0.0
Last Update		:	7/25/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.RollCollector = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.RollCollector.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const RollCollector = (() => {
    const apiproject = 'RollCollector';
    const version = '1.0.0';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1658776986514);
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
    const checkInstall = () => {
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
                        settings: {
                            equation: '1d20',
                            cycles: 100000,
                            batch: 1
                        },
                        defaults: {
                            equation: '1d20',
                            cycles: 100000,
                            batch: 1
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
    const manageState = {
        reset: () => Object.keys(state[apiproject].defaults).forEach(k => state[apiproject].settings[k] = state[apiproject].defaults[k]),
        clone: () => { return _.clone(state[apiproject].settings); },
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; },
        hasSetting: (p) => { return state[apiproject].settings.hasOwnProperty(p); }
    };
    const HE = (() => { // HTML Escaping function
        const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g, '\\$1');
        const e = (s) => `&${s};`;
        const entities = {
            '<': e('lt'),
            '>': e('gt'),
            "'": e('#39'),
            '@': e('#64'),
            '{': e('#123'),
            '|': e('#124'),
            '}': e('#125'),
            '[': e('#91'),
            ']': e('#93'),
            '"': e('quot')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
        return (s) => s.replace(re, (c) => (entities[c] || c));
    })();
    // CSS ================================================
    const defaultThemeColor1 = `#2A4F6E`;
    const defaultThemeColor2 = `#5584ab`;
    const defaultThemeColorCareful = `#FF5959`;
    const defaultButtonCSS = {
        'background-color': defaultThemeColor2,
        'border-radius': '6px',
        'min-width': '25px',
        'padding': '6px 8px'
    };
    const defaultMessageHeaderCSS = {
        'border-bottom': `1px solid #000000`,
        'font-weight': `bold`,
        'line-height': `22px`,
        'background-color': '#dedede'
    };
    const defaultMessageBodyCSS = {};
    const shadoweddivCSS = {
        'margin': '0px 16px 16px 0px',
        'box-shadow': '5px 8px 8px #888888'
    };
    const boundingdivCSS = {
        width: '100%',
        border: 'none'
    };
    const defaultdivCSS = {
        "border-radius": `10px`,
        "border": `2px solid #000000`,
        "background-color": '#00000000',
        "overflow": `hidden`
    };
    const defaulttableCSS = {
        width: '100%',
        margin: '0 auto',
        "border-collapse": 'collapse',
        "font-size": '12px',
        "font-family": `"Segoe UI", Roboto, "Helvetica Neue", sans-serif`,
        "color": "#2e2e2e"
    };
    const defaultaCSS = {};
    const defaulttrCSS = {
        "color": "#2e2e2e",
        "background-color": 'white'
    };
    const tableHeaderRowCSS = {
        "background-color": defaultThemeColor1,
        "color": 'white',
        "font-size": "1.3em"
    }
    const defaulttdCSS = {
        padding: '4px',
        'min-width': '10px'
    };
    const defaulth1CSS = {};
    const defaulth2CSS = {};

    const combineCSS = (origCSS = {}, ...assignCSS) => {
        return Object.assign({}, origCSS, assignCSS.reduce((m, v) => {
            return Object.assign(m, v || {});
        }), {});
    };
    const assembleCSS = (css) => {
        return `"${Object.keys(css).map((key) => { return `${key}:${css[key]};` }).join('')}"`;
    };
    const html = {

        div: (content, CSS) => `<div style=${assembleCSS(combineCSS(defaultdivCSS, (CSS || {})))}>${content}</div>`,
        table: (content, CSS) => `<table style=${assembleCSS(combineCSS(defaulttableCSS, (CSS || {})))}>${content}</table>`,
        tr: (content, CSS) => `<tr style=${assembleCSS(combineCSS(defaulttrCSS, (CSS || {})))}>${content}</tr>`,
        td: (content, CSS) => `<td style=${assembleCSS(combineCSS(defaulttdCSS, (CSS || {})))}>${content}</td>`,
        h1: (content, CSS) => `<h1 style=${assembleCSS(combineCSS(defaulth1CSS, (CSS || {})))}>${content}</h1>`,
        h2: (content, CSS) => `<h2 style=${assembleCSS(combineCSS(defaulth2CSS, (CSS || {})))}>${content}</h2>`,
        a: (content, CSS, link) => `<a href="${link}" style=${assembleCSS(combineCSS(defaultaCSS, (CSS || {})))}>${content}</a>`

    }
    const btnAPI = ({ api: api = "", label: btnlabel = "Run API", css: css = defaultButtonCSS } = {}) => {
        let btncss = combineCSS(defaultButtonCSS, css)
        return html.a(btnlabel, btncss, HE(api));
    };

    const msgbox = ({
        msg: msg = "message",
        title: title = `${apiproject} Output`,
        btn: btn = "buttons",
        sendas: sendas = `${apiproject}`,
        whisperto: whisperto = "",
        headercss: headercss = tableHeaderRowCSS,
        bodycss: bodycss = {}
    }) => {
        let hdrCSS = combineCSS(defaultMessageHeaderCSS, headercss);
        let bodyCSS = combineCSS(defaultMessageBodyCSS, bodycss);

        let hdr = html.tr(html.td(title, {}), hdrCSS);
        let body = Array.isArray(msg) ? html.tr(html.table(msg.join(''))) : html.tr(html.td(msg, {}), bodyCSS);
        let buttons = btn !== "buttons" ? html.tr(html.td(btn, { 'text-align': `right`, 'margin': `4px 4px 8px`, 'padding': '8px' }), {}) : "";

        let output = html.div(html.div(html.table(`${hdr}${body}${buttons}`, {}), shadoweddivCSS), boundingdivCSS);
        if (whisperto) output = `/w "${whisperto}" ${output}`;
        sendChat(sendas, output);
    };


    const rollObject = {};
    const generateUUID = (() => { // MODIFIED FOR THIS SCRIPT!
        let a = 0;
        let b = [];

        return () => {
            let c = (new Date()).getTime() + 0;
            let f = 7;
            let e = new Array(8);
            let d = c === a;
            a = c;
            for (; 0 <= f; f--) {
                e[f] = "~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ=abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
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
                c += "~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ=abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    })();
    
    const getStored = (whisperto) => {
        whisperto = whisperto.replace(/\s\(GM\)$/i, m => { return ''; });
        if (!Object.keys(rollObject).length) {
            msgbox({ msg: 'There are no rolls currently stored.', title: 'Roll Collector Stored Rolls', whisperto: whisperto });
        } else {
            let entries = Object.keys(rollObject).map(k => {
                let cmd = `!collect --info#${k}`;
                return html.tr(html.td(new Date(rollObject[k].creationDate).toUTCString()) + html.td(btnAPI({ api: cmd, label: 'Get Info' }),{ "text-align": 'right' }));
            });
            msgbox({ msg: entries, title: 'Roll Collector Stored Rolls', whisperto: whisperto });
        }
    };
    const getInfo = (rollID, whisperto) => {
        let rollState = rollObject[rollID];
        whisperto = whisperto.replace(/\s\(GM\)$/i, m => { return ''; });
        if (!rollState) {
            msgbox({ msg: `No roll found for that ID. Please try again.`, title: `Roll Collector Invalid Roll`, whisperto: whisperto });
            return;
        }
        let entries = [
            html.tr(html.td('Roll Date') + html.td(new Date(rollState.creationDate).toUTCString(), { "text-align": 'right' })),
            html.tr(html.td('Equation') + html.td(rollState.equation, { "text-align": 'right' })),
            html.tr(html.td('Cycles') + html.td(rollState.cycles, { "text-align": 'right' })),
            html.tr(html.td('Batch Size') + html.td(rollState.batch, { "text-align": 'right' })),
            html.tr(html.td('Total Rolls') + html.td(rollState.rolls.length, { "text-align": 'right' })),
            html.tr(html.td('Average') + html.td(Math.round(rollState.avg * 1000) / 1000, { "text-align": 'right' })),
            html.tr(html.td('') + html.td(btnAPI({ api: `!collect --output#${rollID}`, label: 'Output Details' }), {"text-align":'right'}))
        ];
        msgbox({ msg: entries, title: 'Roll Collector Roll Info', whisperto: whisperto });
    };
    const outputInfo = (rollID, whisperto) => {
        whisperto = whisperto.replace(/\s\(GM\)$/i, m => { return ''; });

        let name = 'Roll Collector Output';
        let rollState = rollObject[rollID];
        if (!rollState) {
            msgbox({ msg: `No roll found for that ID. Please try again.`, title: `Roll Collector Invalid Roll`, whisperto: whisperto });
            return;
        }
        let collectorho = findObjs({ type: "handout", name: name })[0] || createObj('handout', { name: name, inplayerjournals: 'all', archived: false });
        let api = `http://journal.roll20.net/handout/${collectorho.id}`;
        let notes = html.h1(`Roll Collector Output`, {}) + `\n` +
            html.h2(`Roll info collected ${new Date(rollState.creationDate).toUTCString()}`) +
            html.table(
                rollState.rolls.map(r => { return html.tr(html.td(r.results.total)) }).join('')
            );
        collectorho.set({ notes: notes });

        msgbox({
            msg: [
                html.tr(html.td(`Roll information output to handout named '${name}'.`)),
                html.tr(html.td(btnAPI({ api: api, label: `Open`, css: { "color": "white" } }), { "text-align": "right" }))
            ],
            title: "Roll Collector Output",
            whisperto: whisperto
        });
    };

    const getConfig = (whisperto) => {
        whisperto = whisperto.replace(/\s\(GM\)$/i, m => { return ''; });
        let entries = Object.keys(manageState.clone()).map(k => {
            return html.tr(html.td(k) + html.td(manageState.get(k)) + html.td(btnAPI({ api: `!collect --set ${k}#?{New setting for ${k}|${manageState.get(k)}}`, label: `Change` }), {"text-align":'right'}));
        });
        entries.push(html.tr(html.td('RESET') + html.td('') + html.td(btnAPI({ api: `!collect --reset`, label: `Defaults`, css: { "background-color": defaultThemeColorCareful } }), {"text-align":'right'})));
        msgbox({ msg: entries, title: 'Roll Collector Configuration', whisperto: whisperto });
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        let rollState = manageState.clone();
        let argObj = {rolling: true};
        let args;
        let res;
        let takeAction = false;
        if (/^!collect/i.test(msg.content)) {

            args = msg.content.split(/\s+--/).slice(1);
            rollState.id = generateUUID();
            rollState.creationDate = Date.now();
            rollState.rolls = [];
            rollState.remainingCycles = rollState.cycles;
            rollState.breakpoints = Array(10).fill(rollState.cycles).reduce((m, v, i) => {
                m.push(Math.floor(
                    v - (i * (v / 10))
                ));
                return m;
            }, []);
            args.forEach(a => {
                res = /^(?<key>equation|cycles|batch)(?:#|\|)(?<value>.+)/i.exec(a);
                if (res) {
                    rollState[res.groups.key] = res.groups.value;
                    return;
                };
                res = /^set\s+(?<key>equation|cycles|batch)(?:#|\|)(?<value>.+)/i.exec(a);
                if (res) {
                    argObj.rolling = false;
                    argObj.settingUpdated = true;
                    if (manageState.hasSetting(res.groups.key)) {
                        manageState.set(res.groups.key, res.groups.value);
                    }
                    return;
                }
                if (/^config/i.test(a)) {
                    argObj.rolling = false;
                    argObj.showConfig = true;
                    return;
                }
                if (/^stored/i.test(a)) {
                    argObj.rolling = false;
                    argObj.showStored = true;
                    return;
                }
                res = /^info(?:#|\|)(?<value>.+)/i.exec(a);
                if (res) {
                    argObj.rolling = false;
                    argObj.showInfo = true;
                    argObj.rollID = res.groups.value;
                    return;
                }
                res = /^output(?:#|\|)(?<value>.+)/i.exec(a);
                if (res) {
                    argObj.rolling = false;
                    argObj.outputInfo = true;
                    argObj.rollID = res.groups.value;
                    return;
                }
                if (/^reset/i.test(a)) {
                    argObj.rolling = false;
                    argObj.reset = true
                }
            });

            if (argObj.settingUpdated || argObj.showConfig) {
                getConfig(msg.who);
                return;
            }
            if (argObj.showStored) {
                getStored(msg.who);
                return;
            }
            if (argObj.showInfo) {
                getInfo(argObj.rollID, msg.who);
                return;
            }
            if (argObj.outputInfo) {
                outputInfo(argObj.rollID, msg.who);
                return;
            }
            if (argObj.reset) {
                manageState.reset();
                getConfig(msg.who);
                return;
            }
            // if we've made it this far, commit the new rollState to the rollObject
            rollState.rolls = [];
            rollState.who = msg.who
            rollObject[rollState.id] = rollState;
            takeAction = true;
        } else if (Object.keys(rollObject).length && new RegExp(`^!(${Object.keys(rollObject).join('|')})`)) { // catch returning call of existing roll on the rollObject
            // existing rolls should come in as: !rollUUID $[[0]] $[[1]]
            rollState = rollObject[msg.content.slice(1, msg.content.indexOf(' '))];
            if (msg.inlinerolls && msg.inlinerolls.length) {
                msg.inlinerolls.forEach(r => rollState.rolls.push(r));
            }
            rollState.remainingCycles--;
            takeAction = true;
        }
        if (!takeAction) return;
        if (rollState.remainingCycles > 0) { // send next message
            if (rollState.breakpoints.includes(rollState.remainingCycles)) {
                sendChat('RollCollector', `${(10 - rollState.breakpoints.indexOf(rollState.remainingCycles)) * 10}% ...*working*...`);
            }
            sendChat('API', `!${rollState.id} ${Array(Number(rollState.batch)).fill(`[[${rollState.equation}]]`).join(' ')} {&skip}`);
        } else { // final processing
            rollState.avg = rollState.rolls.length ? rollState.rolls.reduce((m, r) => { return m + (r.results.total || 0); }, 0) / rollState.rolls.length : 0;
            getInfo(rollState.id, rollState.who);
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);

    };
    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
        registerEventHandlers();
    });
    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.RollCollector.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.RollCollector.offset); } }