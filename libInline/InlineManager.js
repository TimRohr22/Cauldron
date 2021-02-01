/*
=========================================================
Name			:	libInline
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/libInline
Roll20 Contact	:	timmaugh & The Aaron
Version			:	0.1.6
Last Update		:	2/1/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.libInline = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.libInline.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const libInline = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const vrs = '0.1.6';
    const vd = new Date(1612204892657);
    const apiproject = 'libInline';
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${vrs}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
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
    const msgtable = '<div style="width:100%;"><div style="border-radius:10px;border:2px solid #000000;background-color:__bg__; margin-right:16px; overflow:hidden;"><table style="width:100%; margin: 0 auto; border-collapse:collapse;font-size:12px;">__TABLE-ROWS__</table></div></div>';
    const msg1header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td colspan = "__colspan__">__cell1__</td></tr>';
    const msg1row = '<tr style="background-color:__bg__;"><td style="padding:4px;"><div style="__row-css__">__cell1__</div></td></tr>';
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
    const replacer = (key, value) => {
        // Filtering out properties
        if (key === 'signature') {
            return undefined;
        }
        return value;
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

    // ==================================================
    //		PARSING OPERATIONS
    // ==================================================

    const conditionalPluck = (array, key, cobj = {}) => {
        // test array of objects to return a given property of each object if all conditions are met
        // cobj properties are functions testing that property (k) in the evaluated object (o)
        // to test if testedproperty equals a given value: { testedProperty: (k,o) => { return o[k] === 'given value'; } }
        // to test if testedproperty exists:               { testedProperty: (k,o) => { return o.hasOwnProperty(k); } }
        return array.map(o => {
            let b = true;
            if (cobj) {
                Object.keys(cobj).forEach(k => {
                    if (b && !cobj[k](k, o)) {
                        b = false;
                    }
                });
            }
            if (b) return o[key];
        }).filter(e => e);
    };
    const ops = {
        '==': (v, p) => v === p,
        '>=': (v, p) => v >= p,
        '<=': (v, p) => v <= p
    };

    const getQuantum = (roll) => {
        return (roll.dice.length || roll.total) ? true : false;
    };
    const fatedie = {
        [-2]: '=',
        [-1]: '-',
        [0]: '0',
        [1]: '+'
    };
    const typeLib = {
        all: {},
        included: { type: (k, o) => { return o[k] !== 'drop'; } },
        success: { type: (k, o) => { return o[k] === 'success'; } },
        crit: { type: (k, o) => { return o[k] === 'success'; } },
        fail: { type: (k, o) => { return o[k] === 'fail'; } },
        fumble: { type: (k, o) => { return o[k] === 'fail'; } },
        allcrit: { type: (k, o) => { return ['fail', 'success'].includes(o[k]); } },
        dropped: { type: (k, o) => { return o[k] === 'drop'; } }
    };

    const collectRollData = (r) => {
        const rollspancss1 = `<span class="basicdiceroll`;
        const rollspancss2 = `>`;
        const rollspanend = `</span>`;
        const cssClassLib = {
            dropped: 'drop',
            critfail: 'fail',
            critsuccess: 'success'
        };
        let matchFormatObj = {};
        let rollData = {
            parsed: '',
            tableReturns: [],
            display: {},
            dice: [],
        };
        let gRoll,
            cssclass = '',
            type = '';
        switch (r.type) {
            case 'R': // ROLL
                if (r.table) { // table roll
                    rollData.parsed = '(' + r.results.map(nr => nr.tableItem ? nr.tableItem.name : nr.v).join('+') + ')';
                    rollData.display = rollData.parsed;
                    rollData.tableReturns.push({ table: r.table, returns: r.results.map(nr => nr.tableItem ? nr.tableItem.name : nr.v) });
                } else { // standard roll (might include fate or matched dice)
                    rollData.parsed = '(' + r.results.map(nr => r.fate ? fatedie[nr.v] : nr.v).join('+') + ')';
                    rollData.dice = r.results.map(nr => {
                        cssclass = '';
                        if (nr.d) cssclass = 'dropped'; //dropped die
                        if (!cssclass) {
                            if (r.mods && r.mods.hasOwnProperty('customFumble')) {
                                if (r.mods.customFumble.reduce((m, o) => ops[o.comp](nr.v, o.point) || m, false)) cssclass = 'critfail';
                            } else if (!r.fate && nr.v === 1) { // standard fail
                                cssclass = 'critfail';
                            } else if (r.fate && nr.v >= -1) { // fate fail
                                cssclass = 'critfail';
                            }
                        }
                        if (!cssclass) {
                            if (r.mods && r.mods.hasOwnProperty('customCrit')) {
                                if (r.mods.customCrit.reduce((m, o) => ops[o.comp](nr.v, o.point) || m, false)) cssclass = 'critsuccess';
                            } else if (!r.fate && nr.v === r.sides) { // standard success
                                cssclass = 'critsuccess';
                            } else if (r.fate && nr.v === 1) { // fate success
                                cssclass = 'critsuccess';
                            }
                        }
                        
                        type = cssClassLib[cssclass];

                        // match dice formatting
                        if (r.mods && r.mods.match) {
                            matchFormatObj = {};
                            if (Array.isArray(r.mods.match.matches)) {
                                r.mods.match.matches.forEach((m, i) => {
                                    if (m) matchFormatObj[i] = ` style=\"color: ${m}\"`;
                                });
                            } else {
                                Object.keys(r.mods.match.matches).forEach(k => matchFormatObj[k] = ` style=\"color: ${r.mods.match.matches[k]}\"`);
                            }
                        }
                        return { v: nr.v, type: type, display: `${rollspancss1}${cssclass ? ' ' : ''}${cssclass}${/^crit/g.test(cssclass) ? ' ' : ''}\"${(matchFormatObj[nr.v] && type!=='drop') ? matchFormatObj[nr.v] : '' }>${r.fate ? fatedie[nr.v] : nr.v}${rollspanend}` };
                    });
                    rollData.display = '(' + conditionalPluck(rollData.dice, 'display').join('+') + ')';
                }
                break;
            case 'G': // ROLL
                gRoll = r.rolls.map(nr => {
                    return nr.map(collectRollData);
                });
                rollData.parsed = '{' + gRoll.map(nr => nr.map(nr2 => nr2.parsed).join('')).join(',') + '}';
                rollData.dice = [].concat(...gRoll.map(nr => [].concat(...nr.map(nr2 => nr2.dice))));
                rollData.tableReturns = [].concat(...gRoll.map(nr => [].concat(...nr.map(nr2 => nr2.tableReturns))));
                rollData.display = '{' + gRoll.map(nr => nr.map(nr2 => nr2.display).join('')).join(',') + '}';
                break;
            case 'M': // MODIFIER
                rollData.parsed = r.expr;
                rollData.display = r.expr;
                break;
            case 'L': // LABEL

                break;
            case 'C': // CATCH

                break;
            default: // UNKNOWN

                break;
        }
        return rollData;
    };


    const parseInlineRolls = (inlinerolls) => {
        let labelrx = /(?:\s*(\+|-|\\|\*)\s*)?(?<value>[^\]{}]+)(?<!\d+t)\[(?<key>.*?)]/g;
        return inlinerolls.map(r => {
            let roll = {
                expression: r.expression,
                parsed: '',
                resultType: r.results.resultType,
                total: r.results.total,
                value: r.results.total, // changed later, if necessary
                labels: {},
                labelArray: [],
                tableReturns: [],
                display: {},
                dice: [],
            };
            // LABELS
            let m;
            labelrx.lastIndex = 0;
            while ((m = labelrx.exec(r.expression)) !== null) {
                if (m.index === labelrx.lastIndex) {
                    labelrx.lastIndex++;
                }
                roll.labelArray.push({ label: m.groups.key, value: m.groups.value });
                roll.labels[m.groups.key] = m.groups.value;
            };
            let rollData = r.results.rolls.map(collectRollData);
            // PARSED
            roll.parsed = conditionalPluck(rollData, 'parsed').join('');
            // TABLE RETURNS
            roll.tableReturns = [].concat(...conditionalPluck(rollData, 'tableReturns'));
            // ALL DICE
            roll.dice = [].concat(...conditionalPluck(rollData, 'dice'));
            // CHAT VALUE
            roll.value = getQuantum(roll) ? roll.total : roll.tableReturns[0].returns[0];
            // DISPLAY
            roll.display = conditionalPluck(rollData, 'display').join('');

            // LATE EVAL METHODS
            roll.getDice = (type) => { return conditionalPluck(roll.dice, 'v', (typeLib[type] || typeLib.included)) };
            roll.getTableValues = () => {
                return roll.tableReturns.reduce((m, r) => {
                    m.push(...r.returns);
                    return m;
                }, []);
            };
            roll.getRollTip = () => {
                const rolltypeclasses = {
                    0: '',
                    1: ' fullfail',
                    2: ' fullcrit',
                    3: ' importantroll'
                };
                let parts = [];
                parts.push(`<span class=\"inlinerollresult showtip tipsy-n-right`);
                parts.push(`${rolltypeclasses[(/basicdiceroll\scritfail/.test(roll.display) ? 1 : 0) + (/basicdiceroll\scritsuccess/.test(roll.display) ? 2 : 0)]}\" `);
                parts.push(`original-title=\"`);
                parts.push(`${ HE(getQuantum(roll) ? '<img src=\"/images/quantumrollwhite.png\" class=\"inlineqroll\"> \"> ' : '' )}`);
                parts.push('Rolling' + HE(`${roll.expression} = ${roll.display}`) + `\">${roll.value}</span>`);
                log(parts.join(''));
                return parts.join('');
            };

            return roll;
        });
    };
    const getRollFromInline = (ira) => {
        if (Array.isArray(ira) && ira.length) {
            return parseInlineRolls([ira[0]])[0];
        } else if (typeof ira === 'object') {
            return parseInlineRolls([ira])[0];
        } else return;
    }

    // ==================================================
    //		EXPOSED INTERFACE FUNCTIONS
    // ==================================================
    const getRollData = (ira) => {
        let pir;
        if (typeof ira === 'object' && ira.hasOwnProperty('inlinerolls')) {
            pir = parseInlineRolls(ira.inlinerolls);
        } else if (Array.isArray(ira) && ira.length) {
            pir = parseInlineRolls(ira);
        }
        return pir;
    };
    const getDice = (inlinerolls, type = 'included') => {
        return conditionalPluck((getRollFromInline(inlinerolls) || { dice: [] }).dice, 'v', (typeLib[type] || typeLib.included));
    };
    const getValue = (inlinerolls) => {
        return (getRollFromInline(inlinerolls) || { value: '' }).value;
    };
    const getTables = (inlinerolls, reduce = true) => {
        if (reduce) {
            return (getRollFromInline(inlinerolls) || { getTableValues: () => { return ''; } }).getTableValues();
        } else {
            return (getRollFromInline(inlinerolls) || { tableReturns: [] }).tableReturns;
        }
    };
    const getParsed = (inlinerolls) => {
        return (getRollFromInline(inlinerolls) || { parsed: '' }).parsed;
    };
    const getRollTip = (inlinerolls) => {
        return (getRollFromInline(inlinerolls) || { display: '' }).getRollTip();
    };

    on('chat:message', (msg) => {

        //        if (msg.type !== "api") {
        //            return;
        //        }

        if (_.has(msg, 'inlinerolls')) {
            // let ird = parseInlineRolls(msg.inlinerolls);
            let ird = libInline.getRollData(msg);
            //ird.forEach(r => r.all = r.getDice('all'));
            //ird.forEach(r => r.included = r.getDice('included'));
            //ird.forEach(r => r.success = r.getDice('success'));
            //ird.forEach(r => r.fail = r.getDice('fail'));
            //ird.forEach(r => r.allcrit = r.getDice('allcrit'));
            //ird.forEach(r => r.dropped = r.getDice('dropped'));
            //ird.forEach(r => r.displayCompare = r.getRollTip());

            //let ird = {
            //    all: libInline.getDice(msg.inlinerolls[0], 'all'),
            //    included: libInline.getDice(msg.inlinerolls[0], 'included'),
            //    success: libInline.getDice(msg.inlinerolls[0], 'success'),
            //    fail: libInline.getDice(msg.inlinerolls[0], 'fail'),
            //    allcrit: libInline.getDice(msg.inlinerolls[0], 'allcrit'),
            //    dropped: libInline.getDice(msg.inlinerolls[0], 'dropped'),
            //    tables: libInline.getTables(msg.inlinerolls[0],false),
            //    tableArray: libInline.getTables(msg.inlinerolls[0],true)
            //};
            msgbox({ t: 'INLINE ROLL ORIGINAL', c: `<div><pre style="background: transparent; border: none;white-space: pre-wrap;font-family: Inconsolata, Consolas, monospace;">${syntaxHighlight(msg.inlinerolls || '', replacer).replace(/\n/g, '<br>')}</pre></div>`, send: true });
            msgbox({ t: 'INLINE ROLL PARSED', c: `<div><pre style="background: transparent; border: none;white-space: pre-wrap;font-family: Inconsolata, Consolas, monospace;">${syntaxHighlight(ird || '').replace(/\n/g, '<br>')}</pre></div>`, send: true });

             sendChat('API', `<div>${msg.content.replace(/\$\[\[(\d+)]]/g, ((m, g1) => ird[g1].getRollTip()))}</div>`);
            // sendChat('API', `<div>${msg.content.replace(/\$\[\[(\d+)]]/g, ((m, g1) => libInline.getRollTip(msg.inlinerolls[g1])))}</div>`);
        }
    });
    on('ready', () => {
        versionInfo();
        logsig();
    });

    return {
        getRollData: getRollData,
        getDice: getDice,
        getValue: getValue,
        getTables: getTables,
        getParsed: getParsed,
        getRollTip: getRollTip
    }

})();