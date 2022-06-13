/*
=========================================================
Name			:	RollMasterD100
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	0.0.1
Last Update		:	6/13/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.RollMasterD100 = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.RollMasterD100.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const Ranger = (() => {
    const apiproject = 'RollMasterD100';
    const version = '0.0.1';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1655132125184);
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
    const controlArgs = {
        die: 100,
        lowx: 5,
        highx: 96
    };

    const getRMd100 = (m = [{ val: 0, connector: '+' }], last = '+') => {
        let r = randomInteger(controlArgs.die);
        if (r <= controlArgs.lowx) {
            m.push({ val: r, label: '', connector: last === '+' ? '-' : '+' });
            m = getRMd100(m, last === '+' ? '-' : '+');
        } else if (r >= controlArgs.highx) {
            m.push({ val: r, label: '', connector: last });
            m = getRMd100(m, last);
        } else {
            m.push({ val: r, label: '', connector: '' });
        }
        return m;
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        if (msg.type !== 'api' || !/^!rmd100/.test(msg.content.toLowerCase())) return;

        // reduce all inline rolls - this rewrites the content of the msg to be the output of an inline roll rather than the $[[0]], $[[1]], etc.
        if (_.has(msg, 'inlinerolls')) {
            msg.content = _.chain(msg.inlinerolls)
                .reduce(function (m, v, k) {
                    m['$[[' + k + ']]'] = v.results.total || 0;
                    return m;
                }, {})
                .reduce(function (m, v, k) {
                    return m.replace(k, v);
                }, msg.content)
                .value();
        }
        let argrx = /([^#|]+)(?:#|\|)?(.*)/g,
            res,
            whisper = '',
            report = false,
            valueOnly = false;
        let args = msg.content.split(/\s+--/)          // split at argument delimiter
            .slice(1)                                  // drop the api tag
            .map(a => {                                // split each arg at # or |, (foo#bar becomes [foo, bar])
                argrx.lastIndex = 0;
                if (argrx.test(a)) {
                    argrx.lastIndex = 0;
                    res = argrx.exec(a);
                    if (res[1].toLowerCase() === 'reset') {
                        Object.assign(controlArgs, {
                            die: 100,
                            lowx: 5,
                            highx: 96
                        });
                        report = true;
                        return undefined;
                    } else if (res[1].toLowerCase() === 'report') {
                        report = true;
                        return undefined;
                    } else if (res[1].toLowerCase() === 'value') {
                        valueOnly = true;
                        return undefined;
                    } else if (['die', 'lowx', 'highx'].includes(res[1].toLowerCase()) && !isNaN(res[2])) {
                        controlArgs[res[1]] = res[2];
                        return undefined;
                    } else if (['whisper'].includes(res[1].toLowerCase())) {
                        if (!res[2].length) { // if argument is blank, whisper to the message 'who'
                            whisper = `/w ${msg.who.indexOf(' ') > 0 ? msg.who.slice(0, msg.who.indexOf(' ')) : msg.who} `;
                        } else {
                            whisper = `/w ${res[2]} `;
                        }
                        
                        return undefined;
                    }
                    else {
                        return res[2] && res[2].length ? [res[1], res[2]] : ['',res[1]];
                    }
                } else {
                    return ['', a];
                }
            })
            .filter(a => a);                           // remove undefined elements

        let roll = getRMd100().slice(1);

        args.map(a => { return a[0].length ? [`[${a[0]}]`, a[1]] : a; })
            .forEach(a => {
                if (isNaN(a[1])) return;
                if (roll[roll.length - 1].connector === '') roll[roll.length - 1].connector = '+';
                roll.push({ val: Number(a[1]), label: a[0], connector: '' });
            });

        const getRollValue = () => {
            return roll.reduce((m, v) => {
                return m + (v.connector === '-' ? -1 * v.val : v.val);
            }, 0);
        };
        const getRollAsInline = () => {
            return `[[${roll.map(r => r.val + r.label + r.connector).join('')}]]`;
        };
        if (msg.eval) {
            if (valueOnly) {
                return getRollValue();
            } else {
                return `${getRollAsInline()}`;
            }
        } else {
            if (report) {
                sendChat('API', `${whisper}RollMaster D100 is using 1d${controlArgs.die}, exploding on ${controlArgs.highx} or more, exploding and flipping the sign on ${controlArgs.lowx} or less.`);
            } else {
                if (valueOnly) {
                    sendChat('API', `${whisper}${getRollValue()}`);
                } else {
                    sendChat('API', `${whisper}${getRollAsInline()}`);
                }
            }
        }
    };

    const rmd100 = (m) => handleInput(m);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        try {
            Plugger.RegisterRule(rmd100);
        } catch (error) {
            log(`ERROR Registering to PlugEval: ${error.message}`);
        }
    });
    return {
    };
})();

{ try { throw new Error(''); } catch (e) { API_Meta.RollMasterD100.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.RollMasterD100.offset); } }