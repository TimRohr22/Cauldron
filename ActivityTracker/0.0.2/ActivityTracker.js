/*
=========================================================
Name			:	ActivityTracker
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/ActivityTracker
Roll20 Contact	:	timmaugh
Version			:	0.0.2
Last Update		:	8/13/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.ActivityTracker = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.ActivityTracker.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const ActivityTracker = (() => {
    const apiproject = 'ActivityTracker';
    const version = '0.0.2';
    const schemaVersion = 0.3;
    API_Meta[apiproject].version = version;
    const vd = new Date(1628866603854);
    let stateReady = false;
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        assureState();
    };
    // ==================================================
    //		REGISTRATION
    // ==================================================
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {
                case 0.1:
                    state[apiproject] = {
                        config: {
                            armed: true,
                            events: {
                                'add:ability': false,
                                'change:ability': false,
                                'destroy:ability': false,

                                'add:attribute': false,
                                'change:attribute': false,
                                'destroy:attribute': false,

                                'change:campaign': false,

                                'add:card': false,
                                'change:card': false,
                                'destroy:card': false,

                                'add:character': false,
                                'change:character': false,
                                'destroy:character': false,

                                'add:deck': false,
                                'change:deck': false,
                                'destroy:deck': false,

                                'add:graphic': false,
                                'change:graphic': false,
                                'destroy:graphic': false,

                                'add:hand': false,
                                'change:hand': false,
                                'destroy:hand': false,

                                'add:handout': false,
                                'change:handout': false,
                                'destroy:handout': false,

                                'add:jukeboxtrack': false,
                                'change:jukeboxtrack': false,
                                'destroy:jukeboxtrack': false,

                                'add:macro': false,
                                'change:macro': false,
                                'destroy:macro': false,

                                'add:page': false,
                                'change:page': false,
                                'destroy:page': false,

                                'add:path': false,
                                'change:path': false,
                                'destroy:path': false,

                                'add:player': false,
                                'change:player': false,
                                'change:player:_online': true,
                                'destroy:player': false,

                                'add:rollabletable': false,
                                'change:rollabletable': false,
                                'destroy:rollabletable': false,

                                'add:tableitem': false,
                                'change:tableitem': false,
                                'destroy:tableitem': false,

                                'add:text': false,
                                'change:text': false,
                                'destroy:text': false,

                                'add:token': false,
                                'change:token': false,
                                'destroy:token': false,

                                'chat:message': true,

                                'ready': true
                            }
                        },
                        log: []
                    };
                /* break; // intentional dropthrough */ /* falls through */
                case 0.2:
                    state[apiproject].config.dateformat = 'mmm dd yyyy'
                /* break; // intentional dropthrough */ /* falls through */
                case 0.3:
                    state[apiproject].config.colors = {
                        'ready': '#fdc6c6',
                        'chat:message': '#c7e7ff'
                    }
                /* break; // intentional dropthrough */ /* falls through */
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        config: {
                            armed: true,
                            dateformat: 'mmm dd yyyy',
                            events: {
                                'add:ability': false,
                                'change:ability': false,
                                'destroy:ability': false,

                                'add:attribute': false,
                                'change:attribute': false,
                                'destroy:attribute': false,

                                'change:campaign': false,

                                'add:card': false,
                                'change:card': false,
                                'destroy:card': false,

                                'add:character': false,
                                'change:character': false,
                                'destroy:character': false,

                                'add:deck': false,
                                'change:deck': false,
                                'destroy:deck': false,

                                'add:graphic': false,
                                'change:graphic': false,
                                'destroy:graphic': false,

                                'add:hand': false,
                                'change:hand': false,
                                'destroy:hand': false,

                                'add:handout': false,
                                'change:handout': false,
                                'destroy:handout': false,

                                'add:jukeboxtrack': false,
                                'change:jukeboxtrack': false,
                                'destroy:jukeboxtrack': false,

                                'add:macro': false,
                                'change:macro': false,
                                'destroy:macro': false,

                                'add:page': false,
                                'change:page': false,
                                'destroy:page': false,

                                'add:path': false,
                                'change:path': false,
                                'destroy:path': false,

                                'add:player': false,
                                'change:player': false,
                                'change:player:_online': true,
                                'destroy:player': false,

                                'add:rollabletable': false,
                                'change:rollabletable': false,
                                'destroy:rollabletable': false,

                                'add:tableitem': false,
                                'change:tableitem': false,
                                'destroy:tableitem': false,

                                'add:text': false,
                                'change:text': false,
                                'destroy:text': false,

                                'add:token': false,
                                'change:token': false,
                                'destroy:token': false,

                                'chat:message': true,

                                'ready': true
                            },
                            colors: {
                                'ready': '#fdc6c6',
                                'chat:message': '#c7e7ff'
                            }
                        },
                        log: [],
                        version: schemaVersion
                    };
                    break;
            }
        }
    };
    const defaultConfig = {
        armed: true,
        dateformat: 'mmm dd yyyy',
        events: {
            'add:ability': false,
            'change:ability': false,
            'destroy:ability': false,

            'add:attribute': false,
            'change:attribute': false,
            'destroy:attribute': false,

            'change:campaign': false,

            'add:card': false,
            'change:card': false,
            'destroy:card': false,

            'add:character': false,
            'change:character': false,
            'destroy:character': false,

            'add:deck': false,
            'change:deck': false,
            'destroy:deck': false,

            'add:graphic': false,
            'change:graphic': false,
            'destroy:graphic': false,

            'add:hand': false,
            'change:hand': false,
            'destroy:hand': false,

            'add:handout': false,
            'change:handout': false,
            'destroy:handout': false,

            'add:jukeboxtrack': false,
            'change:jukeboxtrack': false,
            'destroy:jukeboxtrack': false,

            'add:macro': false,
            'change:macro': false,
            'destroy:macro': false,

            'add:page': false,
            'change:page': false,
            'destroy:page': false,

            'add:path': false,
            'change:path': false,
            'destroy:path': false,

            'add:player': false,
            'change:player': false,
            'change:player:_online': true,
            'destroy:player': false,

            'add:rollabletable': false,
            'change:rollabletable': false,
            'destroy:rollabletable': false,

            'add:tableitem': false,
            'change:tableitem': false,
            'destroy:tableitem': false,

            'add:text': false,
            'change:text': false,
            'destroy:text': false,

            'add:token': false,
            'change:token': false,
            'destroy:token': false,

            'chat:message': true,

            'ready': true
        },
        colors: {
            'ready': '#fdc6c6',
            'chat:message': '#c7e7ff'
        }
    };
    const assureState = () => {
        if (!stateReady) {
            let send = !(state.hasOwnProperty(apiproject) && state[apiproject].hasOwnProperty('config'));
            checkInstall();
            stateReady = true;
            if (send) msgbox({ c: 'API RESTART REQUIRED: State has been initialized for the Activity Tracker. You should restart your API to allow for proper event registration.', t: 'ACTIVITY TRACKER INITIALIZED', wto: 'gm' });
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

    // ==================================================
    //		MESSAGING / CHAT REPORTING
    // ==================================================
    const HE = (() => {
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
            '"': e('quot'),
            '*': e('#42')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
        return (s) => s.replace(re, (c) => (entities[c] || c));
    })();
    const rowbg = ["#ffffff", "#dedede"];
    const headerbg = {
        normal: rowbg[1],
        critical: "##F46065"
    };
    const msgtable = (bg, tablerows) => `<div style="width:100%;"><div style="border-radius:10px;border:2px solid #000000;background-color:${bg}; margin-right:16px; overflow:hidden;"><table style="width:100%; margin: 0 auto; border-collapse:collapse;font-size:12px;">${tablerows}</table></div></div>`;
    const msg1header = (bg, colspan, cell1) => `<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:${bg}; line-height: 22px;"><td colspan = "${colspan}">${cell1}</td></tr>`;
    const msg2header = (bg, cell1, cell2) => `<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:${bg}; line-height: 22px;"><td>${cell1}</td><td style="border-left:1px solid #000000;">${cell2}</td></tr>`;
    const msg3header = (bg, cell1, cell2, cell3) => `<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:${bg}; line-height: 22px;"><td>${cell1}</td><td style="border-left:1px solid #000000;">${cell2}</td><td style="border-left:1px solid #000000;">${cell3}</td></tr>`;
    const msg1row = (bg, rowcss, cell1) => `<tr style="background-color:${bg};"><td style="padding:4px;"><div style="${rowcss}">${cell1}</div></td></tr>`;
    const msg2row = (bg, cell1, cell2) => `<tr style="background-color:${bg};font-weight:bold;"><td style="padding:1px 4px;">${cell1}</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">${cell2}</td></tr>`;
    const msg3row = (bg, cell1, cell2, cell3) => `<tr style="background-color:${bg};font-weight:bold;"><td style="padding:1px 4px;">${cell1}</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">${cell2}</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">${cell3}</td></tr>`;
    const msgbox = ({ c: c = "chat message", t: t = "title", btn: b = "buttons", send: send = true, sendas: sas = "API", wto: wto = "", type: type = "normal" }) => {
        let hdr = msg1header(headerbg[type], '1', t);
        let row = msg1row(rowbg[0],'',c);
        let btn = b !== 'buttons' ? msg1row(rowbg[0], 'text-align:right;margin:4px 4px 8px;', b) : '';
        let msg = msgtable(rowbg[0], hdr + row + btn);
        if (wto) msg = `/w "${wto}" ${msg}`;
        if (["t", "true", "y", "yes", true].includes(send)) {
            sendChat(sas, msg);
        } else {
            return msg;
        }
    };
    const logmsgbox = ({ c: c = "chat message", t: t = "title", btn: b = "buttons", send: send = true, sendas: sas = "API", wto: wto = "", type: type = "normal" }) => {
        let hdr = msg1header(headerbg[type], '4', t);
        let row = c;
        let btn = b !== 'buttons' ? msg1row(rowbg[0], 'text-align:right;margin:4px 4px 8px;', b) : '';
        let msg = msgtable(rowbg[0], hdr + row + btn);
        if (wto) msg = `/w "${wto}" ${msg}`;
        if (["t", "true", "y", "yes", true].includes(send)) {
            sendChat(sas, msg);
        } else {
            return msg;
        }
    };
    const replacer = (key, value) => {
        // Filtering out properties
        if (key === 'signature') {
            return undefined;
        }
        return value;
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
        let hc = hexToRGB(h);
        return (((hc[0] * 299) + (hc[1] * 587) + (hc[2] * 114)) / 1000 >= 128) ? "#000000" : "#ffffff";
    };
    const validHex = (h, d = '#FFFFFF') => {
        const htmlColors = { aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4', azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000', blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a', burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e', coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c', cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b', darkgray: '#a9a9a9', darkgrey: '#a9a9a9', darkgreen: '#006400', darkkhaki: '#bdb76b', darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc', darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b', darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3', deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22', fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700', goldenrod: '#daa520', gray: '#808080', grey: '#808080', green: '#008000', greenyellow: '#adff2f', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c', indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa', lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3', lightgrey: '#d3d3d3', lightgreen: '#90ee90', lightpink: '#ffb6c1', lightsalmon: '#ffa07a', lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32', linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa', mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585', midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6', olive: '#808000', olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6', palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee', palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399', red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd', slategray: '#708090', slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3', white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32' }
        const hexrx = new RegExp(`^(#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})|${Object.keys(htmlColors).join('|')})?$`, 'i');
        let ret = d;
        if (hexrx.test(h)) {
            ret = `#${htmlColors[h.toLowerCase()] || h}`.replace(/^##/, '#');
        }
        return ret;
    };

    const syntaxHighlight = (str, replacer = undefined) => {
        const css = {
            stringstyle: 'mediumblue;',
            numberstyle: 'magenta;',
            booleanstyle: 'darkorange;',
            nullstyle: 'darkred;',
            keystyle: 'darkgreen;'
        };
        if (typeof str !== 'string') {
            str = JSON.stringify(str, replacer, '   ');
        }
        str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
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
            return '<span style=" color: ' + css[cls] + '">' + HE(match.replace(/^"(.*)"(:?)$/g, ((m, g1, g2) => `${g1}${g2}`)).replace(/\\(.)/g, `$1`)) + '</span>';
        });
    };
    const simpleObj = (o) => JSON.parse(JSON.stringify(o));

    const showObjInfo = (o, t = 'PARSED OBJECT', replacer = undefined, pre = '', buttons = 'buttons') => {
        msgbox({ t: t, c: `${pre}<div><pre style="background: transparent; border: none;white-space: pre-wrap;font-family: Inconsolata, Consolas, monospace;">${syntaxHighlight(o || '', replacer).replace(/\n/g, '<br>')}</pre></div>`, wto: 'gm', btn: buttons });
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

    const trackerIsArmed = () => { return state[apiproject].config.armed };
    const handler = (event = '', obj = {}, prev = {}) => { // tracks event objects (current/previous) with the event and timestamp
        if (!trackerIsArmed || !state[apiproject].config.events[event]) return;
        state[apiproject].log.push({ id: generateUUID(), e: event, o: simpleObj(obj), p: simpleObj(prev), t: Date.now() });
    };
    const handlerE = (event) => { // curries handler to register for every event
        return (obj, prev) => handler(event, obj, prev);
    };

    const viewObj = (id, o) => {
        let logline = state[apiproject].log.filter(l => l.id === id)[0];
        if (!logline) {
            msgbox({ c: 'There is no object associated with that ID. Did you clear your log?', t: 'NO OBJECT FOUND', wto: 'gm' });
            return;
        }
        let thisObject = o === 'prev' ? 'prev' : 'obj';
        let notThisObject = thisObject === 'obj' ? 'prev' : 'obj';
        showObjInfo(logline[['prev', 'p'].includes(o) ? 'p' : 'o'],
            'OBJECT INFO',
            undefined,
            `<div style="width:100%"><div style="width:50%;float:left;font-weight:bold;">Time:</div><div style="width:50%;float:right;">${buildDate(logline.t)}</div></div><div style="width:100%"><div style="width:50%;float:left;font-weight:bold;">Event:</div><div style="width:50%;float:right;">${logline.e}</div></div><div style="width:100%"><div style="width:50%;float:left;font-weight:bold;">Object:</div><div style="width:50%;float:right;">${thisObject}</div></div><hr>`,
            `[EVENT OBJECT: ${notThisObject.toUpperCase()}](!track --object ${id}|${notThisObject}) [CONFIG](!&#13;!track)`
        );
    };
    const months = { 1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN', 7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC' };

    const buildDate = logdate => {
        let d = new Date(logdate);
        switch (state[apiproject].config.dateformat) {
            case 'ddmmmyyyy':
                return ("0" + d.getDate()).slice(-2) + months[d.getMonth() + 1] + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.' + d.getMilliseconds();
            case 'dd-mmm-yyyy':
                return ("0" + d.getDate()).slice(-2) + "-" + months[d.getMonth() + 1] + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.' + d.getMilliseconds();
            case 'ddmmyyyy':
                return ("0" + d.getDate()).slice(-2) + ("0" + (d.getMonth() + 1)).slice(-2) + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.' + d.getMilliseconds();
            case 'dd-mm-yyyy':
                return ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.' + d.getMilliseconds();
            case 'mm-dd-yyyy':
                return ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.' + d.getMilliseconds();
            case 'mmddyyyy':
                return ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2) + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.' + d.getMilliseconds();
            case 'mmm dd yyyy':
            default:
                return months[d.getMonth() + 1] + ' ' + ("0" + d.getDate()).slice(-2) + ' ' + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.' + d.getMilliseconds();
        }
    };
    const buildLog = (evcount) => {
        const getRow = (logline) => {
            let btnO = `[OBJ](!&#13;!track --object ${logline.id}|obj)`;
            let btnP = `[PREV](!&#13;!track --object ${logline.id}|prev)`;
            return `<tr style="background-color:__rowbg__;color:__fg__;font-weight:bold;"><td style="background-color:__bg__;padding:1px 4px;">${buildDate(logline.t)}</td><td style="background-color:__bg__;border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">${logline.e}</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">${btnO}</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">${btnP}</td></tr>`
        };
        return state[apiproject].log.slice(state[apiproject].log.length - evcount).reduce((m, l, i) => {
            let rowbgCol = rowbg[i % 2];
            let bgCol = (state[apiproject].config.colors.hasOwnProperty(l.e) ? state[apiproject].config.colors[l.e] : rowbgCol);
            let fgCol = getTextColor(bgCol);
            m += getRow(l).replace(/__rowbg__/g,rowbgCol).replace(/__bg__/g,bgCol).replace(/__fg__/g,fgCol);
            return m;
        }, '');
    };
    const yesBank = v => {
        return (typeof v === 'boolean' && v) || (typeof v !== 'undefined' && ['yes', 'true', 'y', 't', 'yup', 'on', 'keith'].includes(v.toLowerCase()));
    };
    const handleInput = (msg) => {
        /* expected syntax:
            !track
            !track --defaults/restore
            !track --reset/clear
            !track --set propA|sub|sub=(true/false) propB|sub|sub=(true/false) ...
            !track --set all=(true/false)
            !track --arm
            !track --disarm
            !track --report (all/#)
            !track --object logid|(obj/prev)
            !track --color propA|sub|sub=#FFFFF propB|sub|sub=#000000
        */

        if (msg.type !== 'api') return;
        if (!/^!track(\s|$)/.test(msg.content)) return;
        if (/^!track(\s*$|\s+--current|\s+--config)/.test(msg.content)) {
            let eventquery = `?{Choose Event|${Object.keys(state[apiproject].config.events).map(k => k.replace(/:/g, '&#58;')).join('|')}}`;
            let enabledquery = `?{Choose Event|${Object.keys(state[apiproject].config.events).filter(k => state[apiproject].config.events[k]).map(k => k.replace(/:/g, '&#58;')).join('|')}}`;
            let disabledquery = `?{Choose Event|${Object.keys(state[apiproject].config.events).filter(k => state[apiproject].config.events[k]===false).map(k => k.replace(/:/g, '&#58;')).join('|')}}`;
            let dateformatquery = `?{Choose Date Format|ddmmmyyyy|dd-mmm-yyyy|ddmmyyyy|dd-mm-yyyy|mm-dd-yyyy|mmddyyyy|mmm dd yyyy}`
            showObjInfo(state[apiproject].config,
                `ACTIVITY TRACKER CONFIG`,
                undefined,
                '',
                `[Defaults](!&#13;!track --defaults) ` +
                `${state[apiproject].config.armed ? '[Disarm](!&#13;!track --disarm)' : '[Arm][Disarm](!&#13;!track --arm)'} <br>` +
                `[Enable Event](!track --set ${disabledquery}=true) ` +
                `[Disable Event](!track --set ${enabledquery}=false) <br>` +
                `[Enable All](!track --set all=true) ` +
                `[Disable All](!track --set all=false) <br>` +
                `[Event Color](!track --color ${eventquery}=?{Enter valid HEX color or HTML named color}) ` +
                `[Date Format](!track --format ${dateformatquery}) <br>` +
                `[Clear Log](!track --clear) ` +
                `[REPORT](!track --report all)`
            );
            return;
        };
        let args = msg.content.split(/\s+--/).slice(1);
        let code,
            data,
            temp,
            event,
            value,
            evcount;
        let configupdated = false;
        if (args.filter(a => ['defaults', 'restore'].includes(a.toLowerCase())).length) {
            state[apiproject].config = defaultConfig;
            configupdated = true;
        }
        if (args.filter(a => ['clear', 'reset'].includes(a.toLowerCase())).length) state[apiproject].log = [];
        args.filter(a => !['clear', 'reset', 'defaults', 'restore'].includes(a.toLowerCase())).forEach(a => {
            temp = a.split(/\s+/);
            [code, data] = [temp[0], temp.slice(1)];
            switch (code) {
                case 'set':
                    data.forEach(d => {
                        [event, value] = d.split('=');
                        event = event.split('|').join(':');
                        value = value ? yesBank(value) : true;
                        if (event === 'all') {
                            Object.keys(state[apiproject].config.events).forEach(e => {
                                state[apiproject].config.events[e] = value;
                                configupdated = true;
                            });
                        } else if (state[apiproject].config.events.hasOwnProperty(event)) {
                            state[apiproject].config.events[event] = value;
                            configupdated = true;
                        }
                    });
                    break;
                case 'color':
                    data.forEach(d => {
                        [event, value] = d.split('=');
                        event = event.split('|').join(':');
                        if (['remove', 'rem'].includes(value.toLowerCase())) {
                            delete state[apiproject].config.colors[event];
                            configupdated = true;
                        } else {
                            value = validHex(value, 'unset');
                            if (value !== 'unset' && state[apiproject].config.events.hasOwnProperty(event)) {
                                state[apiproject].config.colors[event] = value;
                                configupdated = true;
                            }
                        }
                    });
                    break;
                case 'arm':
                    state[apiproject].config.armed = true;
                    msgbox({ c: `Activity Tracker is armed.`, t: 'ACTIVITY TRACKER', btn: `[Disarm](!&#13;!track --disarm)`, wto: 'gm' });
                    break;
                case 'disarm':
                    state[apiproject].config.armed = false;
//                    msgbox({ c: `Activity Tracker is ${state[apiproject].config.armed ? '' : 'dis'}armed.`, t: 'ACTIVITY TRACKER', btn: `[${state[apiproject].config.armed ? 'Disarm' : 'Arm'}](!&#13;!track --arm ${!state[apiproject].config.armed})`, wto: 'gm' });
                    msgbox({ c: `Activity Tracker is disarmed.`, t: 'ACTIVITY TRACKER', btn: `[Arm](!&#13;!track --arm)`, wto: 'gm' });
                    break;
                case 'report':
                    evcount = Math.min((data[0] === 'all' ? state[apiproject].log.length : Number(data[0]) || 1), state[apiproject].log.length);
                    // showObjInfo({ log: state[apiproject].log }, 'LOG REPORT');
                    logmsgbox({c: buildLog(evcount), t: 'LOG REPORT', wto: 'gm'});
                    break;
                case 'object':
                    viewObj(data[0].split('|')[0], data[0].split('|')[1] || 'obj');
                    break;
                case 'format':
                    state[apiproject].config.dateformat = data[0];
                    configupdated = true;
                default:

            }
        });
        if (configupdated) {
            msgbox({ c: 'Config updated. Click the button to see the current state of tracking.', t: 'ACTIVITY TRACKER CONFIG UPDATED', btn: '[CONFIG](!&#13;!track)', wto: 'gm' });
        }
    };

    if (state.hasOwnProperty(apiproject)) {
        Object.keys(state[apiproject].config.events).forEach(k => {
            if (state[apiproject].config.events[k] === true) {
                on(k, handlerE(k));
            }
        });
    }

    on('ready', () => {
        logsig();
        versionInfo();
        on('chat:message', handleInput);
        if (state[apiproject].config.armed === true) {
            msgbox({ c: `Activity Tracker is armed.`, t: 'ACTIVITY TRACKER', btn: `[Disarm](!&#13;!track --arm)`, wto: 'gm' });
        }

    })
})();
{ try { throw new Error(''); } catch (e) { API_Meta.ActivityTracker.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ActivityTracker.offset); } }