/*
=========================================================
Name            : UnSanity
GitHub          : 
Roll20 Contact  : timmaugh
Version         : 0.0.1
Last Update     : 1/24/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.UnSanity = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.UnSanity.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const UnSanity = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'UnSanity';
    API_Meta[apiproject].version = '0.0.1';
    const schemaVersion = 0.1;
    const vd = new Date(1643060697640);
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

    // ============================================
    //      PRESENTATION
    // ============================================
    /*
        - color management
        - CSS
        - HTML
        - messaging
        - help construction
    */

    // COLOR MANAGEMENT ===========================
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
    const validateHexColor = (s, d = defaultThemeColor1) => {
        let colorRegX = /(^#?[0-9A-Fa-f]{6}$)|(^#?[0-9A-Fa-f]{3}$)|(^#?[0-9A-Fa-f]{6}\d{2}$)/i;
        return '#' + (colorRegX.test(s) ? s.replace('#', '') : d);
    };

    // CSS ========================================
    const defaultThemeColor1 = '#66806a';
    const defaultThemeColor2 = '#84c6a6';
    const defaultThemeColor3 = '#ffc286';
    const defaultThemeColor4 = '#fff1af';

    const defaultbgcolor = "#ce0f69";
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
    };
    const defaultpCSS = {};
    const defaultaCSS = {};
    const defaulth1CSS = {};
    const defaulth2CSS = {};
    const defaulth3CSS = {};
    const defaulth4CSS = {};
    const defaulth5CSS = {};
    const defaultthCSS = {
        "border-bottom": `1px solid #000000`,
        "font-weight": `bold`,
        "text-align": `center`,
        "line-height": `22px`
    };
    const defaulttrCSS = {};
    const defaulttdCSS = {
        padding: '4px',
        'min-width': '10px'
    };
    const defaultcodeCSS = {};

    const defaultMessageHeaderCSS = {
        'border-bottom': `1px solid #000000`,
        'font-weight': `bold`,
        'line-height': `22px`,
        'background-color': '#dedede'
    };
    const defaultMessageBodyCSS = {};
    const defaultButtonCSS = {
        'background-color': defaultThemeColor1,
        'border-radius': '6px',
        'min-width': '25px',
        'padding': '6px 8px'
    };
    const shadoweddivCSS = {
        'margin': '0px 16px 16px 0px',
        'box-shadow': '5px 8px 8px #888888'
    };
    const boundingdivCSS = {
        width: '100%',
        border: 'none'
    };

    const combineCSS = (origCSS = {}, ...assignCSS) => {
        return Object.assign({}, origCSS, assignCSS.reduce((m, v) => {
            return Object.assign(m, v || {});
        }), {});
    };
    const confirmReadability = (origCSS = {}) => {
        let outputCSS = Object.assign({}, origCSS);
        if (outputCSS['background-color']) outputCSS['background-color'] = validateHexColor(outputCSS['background-color'] || "#dedede");
        if (outputCSS['color'] || outputCSS['background-color']) outputCSS['color'] = getTextColor(outputCSS['background-color'] || "#dedede");
        return outputCSS;
    };
    const assembleCSS = (css) => {
        return `"${Object.keys(css).map((key) => { return `${key}:${css[key]};` }).join('')}"`;
    };

    // HTML =======================================
    const html = {
        div: (content, CSS) => `<div style=${assembleCSS(combineCSS(defaultdivCSS, (CSS || {})))}>${content}</div>`,
        h1: (content, CSS) => `<h1 style=${assembleCSS(combineCSS(defaulth1CSS, (CSS || {})))}>${content}</h1>`,
        h2: (content, CSS) => `<h2 style=${assembleCSS(combineCSS(defaulth2CSS, (CSS || {})))}>${content}</h2>`,
        h3: (content, CSS) => `<h3 style=${assembleCSS(combineCSS(defaulth3CSS, (CSS || {})))}>${content}</h3>`,
        h4: (content, CSS) => `<h4 style=${assembleCSS(combineCSS(defaulth4CSS, (CSS || {})))}>${content}</h4>`,
        h5: (content, CSS) => `<h5 style=${assembleCSS(combineCSS(defaulth5CSS, (CSS || {})))}>${content}</h5>`,
        p: (content, CSS) => `<p style=${assembleCSS(combineCSS(defaultpCSS, (CSS || {})))}>${content}</p>`,
        table: (content, CSS) => `<table style=${assembleCSS(combineCSS(defaulttableCSS, (CSS || {})))}>${content}</table>`,
        th: (content, CSS) => `<th style=${assembleCSS(combineCSS(defaultthCSS, (CSS || {})))}>${content}</th>`,
        tr: (content, CSS) => `<tr style=${assembleCSS(combineCSS(defaulttrCSS, (CSS || {})))}>${content}</tr>`,
        td: (content, CSS) => `<td style=${assembleCSS(combineCSS(defaulttdCSS, (CSS || {})))}>${content}</td>`,
        td2: (content, CSS) => `<td colspan="2" style=${assembleCSS(combineCSS(defaulttdCSS, (CSS || {})))}>${content}</td>`,
        code: (content, CSS) => `<code style=${assembleCSS(combineCSS(defaultcodeCSS, (CSS || {})))}>${content}</code>`,
        a: (content, CSS, link) => `<a href="${link}" style=${assembleCSS(combineCSS(defaultaCSS, (CSS || {})))}>${content}</a>`
    };

    // HTML Escaping function
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
            '"': e('quot')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
        return (s) => s.replace(re, (c) => (entities[c] || c));
    })();

    // MESSAGING ==================================
    const btnAPI = ({ api: api = "", label: btnlabel = "Run API", css: css = defaultButtonCSS } = {}) => {
        let btnCSS = confirmReadability(css);
        //r20css = {};
        //if(['t', 'true', 'y', 'yes', true].includes(r20style)) Object.assign(r20css, {padding: '5px', display: 'inline-block', border: '1px solid white;'});
        return html.a(btnlabel, btnCSS, HE(api));
    };

    const msgbox = ({
        msg: msg = "message",
        title: title = "UnSanity Output",
        btn: btn = "buttons",
        sendas: sendas = "API",
        whisperto: whisperto = "",
        headercss: headercss = {},
        bodycss: bodycss = {}
    }) => {
        let hdrCSS = confirmReadability(combineCSS(defaultMessageHeaderCSS, headercss));
        let bodyCSS = confirmReadability(combineCSS(defaultMessageBodyCSS, bodycss));

        let hdr = html.tr(html.td(title, {}), hdrCSS);
        let body = html.tr(html.td(msg, {}), bodyCSS);
        let buttons = btn !== "buttons" ? html.tr(html.td(btn, { 'text-align': `right`, 'margin': `4px 4px 8px`, 'padding':'8px' }), {}) : "";

        let output = html.div(html.div(html.table(`${hdr}${body}${buttons}`, {}), shadoweddivCSS), boundingdivCSS);
        if (whisperto) output = `/w "${whisperto}" ${output}`;
        sendChat(sendas, output);
    };

    // ==================================================
    //      UNICODE TABLE CONSTRUCTION
    // ==================================================
    const uniTableGenerator = (output="log") => {
        let unarray = [];
        let rowi = 0x0020;
        let arrayrow = [];
        for (let overalli = 0x0020; overalli <= 0x10FFFF; overalli++) {
            arrayrow.push(String.fromCodePoint(overalli || ' '));
            if (arrayrow.length===16) {
                if (output === 'log') {
                    unarray.push(`  0x${('00000' + rowi.toString(16).toUpperCase()).slice(-6, -1)}` + `x | ${arrayrow.join(' | ')} |`);
                } else {
                    unarray.push(html.tr(html.td(`0x${('00000' + rowi.toString(16).toUpperCase()).slice(-6, -1)}x`, {}) + arrayrow.map(r => html.td(r)).join(''), {'text-align':'center'}));
                }
                rowi = overalli + 1;
                arrayrow = [];
            }
        }
        return unarray;
    };
    let uniTableHeaderHTML = html.tr(['&nbsp;', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'].map(a => html.th(a, {})).join(''), {});
    let uniTable = [];
    let uniTableHTML = [];
    const buildUniTable = () => {
        uniTable = uniTableGenerator();
        uniTableHTML = uniTableGenerator('html');
    };


    // ==================================================
    //      OUTPUT TO SCRIPT LOG
    // ==================================================
    const outputToLog = (low, high) => {
        log('\n' +
            '=============================================================================' + '\n' +
            '|                          BEGINNING UNICODE TABLE                          |' + '\n' +
            '=============================================================================' + '\n' +
            `           | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A | B | C | D | E | F |` + '\n' +
            `=============================================================================` + '\n' +
            `${uniTable.slice(low,high).join('\n')}`);
    };
    // ==================================================
    //      OUTPUT TO CHAT
    // ==================================================
    const outputToChat = (low, high) => {
        msgbox({
            msg: html.table(`${uniTableHeaderHTML}${uniTableHTML.slice(low, high).join('')}`),
            headercss: { 'background-color': defaultThemeColor1 }
        });
    };
    // ==================================================
    //      OUTPUT TO HANDOUT
    // ==================================================
    const outputToHandout = (low, high, name = `UnSanity Output`) => { 
        let uniho = findObjs({ type: "handout", name: name })[0] || createObj('handout', { name: name, inplayerjournals: 'all', archived: false });
        let notes = html.h1(`UnSanity Output for Range 0x${parseInt(low * 16 + 32, 10).toString(16).padStart(6, "0").toUpperCase()} - 0x${parseInt(high * 16 + 31, 10).toString(16).padStart(6, "0").toUpperCase()}`, {}) + `\n` +
            html.table(`${uniTableHeaderHTML}${uniTableHTML.slice(low, high).join('')}`);
        uniho.set({ notes: notes });
        api = `http://journal.roll20.net/handout/${uniho.id}`;
        btn = btnAPI({api: api, label: `Open`});

        msgbox({msg: `Help handout named '${name}' created.`, title: "HANDOUT CREATED", btn: btn, headercss: { 'background-color': defaultThemeColor1 } });
    };
    // ==================================================
    //      OUTPUT ALL
    // ==================================================
    const outputToAll = (...args) => {
        outputToChat(...args);
        outputToLog(...args);
        outputToHandout(...args);
    };

    const switchboard = {
        chat: outputToChat,
        handout: outputToHandout,
        log: outputToLog,
        all: outputToAll
    };
    const handleInput = (msg) => {
        /*  EXPECTED SYNTAX:
            !unsanity --chat --low # --high #
            !unsanity --handout --name text
            !unsanity --log
            !unsanity --all
            
        */
        if (msg.type !== 'api') return;
        if (!/^!unsanity(\s|$)/.test(msg.content)) return;

        let createItems = [],
            handoutName = 'UnSanity',
            rangeLow = 0,
            rangeHigh = 0,
            bchar = false,
            err = '';

        const pushItem = (...items) => {
            items.forEach(i => {
                if (!createItems.includes(i)) createItems.push(i);
            })
        };
        let args = msg.content.split(/\s+--/).slice(1);
        if (!args.length) {
            msgbox({
                msg: html.h2(`INTRODUCTION`) +
                    html.p(`UnSanity is a script to test the unicode sanitization around Roll20. Check the code to see if a particular unicode character ` +
                        `survived the one-click processing. Then use the commands, below, to test output to the script log area, to the chat, and to a handout.`) +
                    html.h2(`OUTPUT ARGUMENTS`) +
                    html.table(
                        html.tr(html.th(`ARG`, { 'text-align': 'left', 'min-width':'70px' }) + html.th(`EXPLANATION`, { 'text-align': 'left' })) +
                        html.tr(html.td(`--chat`) + html.td(`Sends selected ouput to chat.`)) +
                        html.tr(html.td(`--handout`) + html.td(`Sends selected ouput to a handout (default name: 'UnSanity Output').`)) +
                        html.tr(html.td(`--log`) + html.td(`Sends selected ouput to the script log.`)) +
                        html.tr(html.td(`--all`) + html.td(`Sends selected ouput to all of the above destinations.`)) +
                        html.tr(html.td(`--name`) + html.td(`Name to use for the handout destination. Only matters if <i><em>handout</em></i> is supplied.`))
                    ) +
                    html.h2(`RANGE ARGUMENTS`) +
                    html.table(
                        html.tr(html.th(`ARG`, { 'text-align': 'left', 'min-width':'70px' }) + html.th(`EXPLANATION`, { 'text-align': 'left' })) +
                        html.tr(html.td(`--low`) + html.td(`Low bound of output; use an integer for row index, or hexadecimal to obtain the row of a given unicode character.`)) +
                        html.tr(html.td(`--high`) + html.td(`Upper bound of output; use an integer for row index, or hexadecimal to obtain the row of a given unicode character.`)) +
                        html.tr(html.td(`--char`) + html.td(`Hexadecimal value; will be translated into the row that contains that unicode character.`))
                    ) +
                    html.p(`NOTE: All hexadecimal values must be between 0x0020 and 0x10FFFF.`) +
                    html.h2(`EXAMPLES`) +
                    html.table(
                        html.tr(html.td2(`!unsanity --chat --low 0 --high 50`, { 'font-weight': 'bold' })) +
                        html.tr(html.td(`&nbsp;`) + html.td(`> outputs rows 0-50 to chat`, { 'font-style': 'italic' })) +
                        html.tr(html.td2(`!unsanity --log`, { 'font-weight': 'bold' })) +
                        html.tr(html.td(`&nbsp;`) + html.td(`> outputs all rows to script log`, { 'font-style': 'italic' })) +
                        html.tr(html.td2(`!unsanity --handout --low 0x01F300 --high 0x01F400`, { 'font-weight': 'bold' })) +
                        html.tr(html.td(`&nbsp;`) + html.td(`> outputs to a handout (default name: 'UnSanity Output') the rows including and between those given characters`, { 'font-style': 'italic' })) +
                        html.tr(html.td2(`!unsanity --handout --name Wompus`, { 'font-weight': 'bold' })) +
                        html.tr(html.td(`&nbsp;`) + html.td(`> outputs entire data set to a handout named 'Wompus'`, { 'font-style': 'italic' })) +
                        html.tr(html.td2(`!unsanity --chat --char 0x01F300`, { 'font-weight': 'bold' })) +
                        html.tr(html.td(`&nbsp;`) + html.td(`> outputs the row of the specified character to chat`, { 'font-style': 'italic' }))
                    ),
                headercss: { 'background-color': defaultThemeColor1 },
                title: `UNSANITY HELP`
            });
        } else {
            args.forEach(a => {
                let keyval = a.trim().split(/\s+/);
                switch (keyval[0].toLowerCase()) {
                    case 'chat':
                        pushItem('chat');
                        break;
                    case 'handout':
                        pushItem('handout');
                        break;
                    case 'log':
                        pushItem('log');
                        break;
                    case 'all':
                        pushItem('chat', 'handout', 'log');
                        break;
                    case 'low':
                        if (bchar) break; // if we used bchar already, don't reset
                        if (/^0x[\da-f]{4,6}/i.test(keyval[1]) && parseInt(keyval[1], 16) >= 0x0020 && parseInt(keyval[1], 16) <= 0x10FFFF) { // look for hex values between 0x0020 and 0x10FFFF
                            rangeLow = Math.floor((keyval[1] - 32) / 16); // convert the hex value into a row index
                        } else {
                            rangeLow = parseInt(keyval[1]) || 0;
                        }
                        break;
                    case 'high':
                        if (bchar) break; // if we used bchar already, don't reset
                        if (/^0x[\da-f]{4,6}/i.test(keyval[1]) && parseInt(keyval[1], 16) >= 0x0020 && parseInt(keyval[1], 16) <= 0x10FFFF) { // look for hex values between 0x0020 and 0x10FFFF
                            rangeHigh = 1 + Math.floor((keyval[1] - 32) / 16); // convert the hex value into a row index
                        } else {
                            rangeHigh = parseInt(keyval[1]) || 0;
                        }
                        break;
                    case 'char':
                        bchar = true;
                        if (/^0x[\da-f]{4,6}/i.test(keyval[1]) && parseInt(keyval[1], 16) >= 0x0020 && parseInt(keyval[1], 16) <= 0x10FFFF) { // look for hex values between 0x0020 and 0x10FFFF
                            rangeLow = Math.floor((keyval[1] - 32) / 16); // convert the hex value into a row index
                            rangeHigh = 1 + Math.floor((keyval[1] - 32) / 16); // convert the hex value into a row index
                        } else {
                            err = 'Invalid unicode hex or value not between 0x0020 and 0x10FFFF.';
                        }
                        break;
                    case 'name':
                        if (/^[A-Za-z]/.test(keyval[1])) handoutName = keyval[1];
                        break;
                    default:
                }
            });
        }
        if (!uniTable.length) {
            buildUniTable();
            if (rangeHigh === 0) rangeHigh = uniTable.length;
            if (rangeLow >= uniTable.length - 1) rangeLow = 0;
        };
        if (err) {
            msgbox({
                msg: err,
                headercss: { 'background-color': defaultThemeColor1 }
            });
        } else {
            createItems.forEach(c => {
                if (switchboard.hasOwnProperty(c)) {
                    switchboard[c](rangeLow, rangeHigh, handoutName);
                } else {
                    log(`UnSanity: Invalid item specified to be created: ${c}`);
                }
            });
        }
    };

    registerHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        versionInfo();
        logsig();
        registerHandlers();
        setTimeout(buildUniTable, 2000);
    });

    return {

    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.UnSanity.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.UnSanity.offset); } }
