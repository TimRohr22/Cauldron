/*
=========================================================
Name			:	APILPlugins01
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	0.0.1
Last Update		:	2/10/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.APILPlugins01 = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.APILPlugins01.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const APILPlugins01 = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'APILPlugins01';
    API_Meta[apiproject].version = '0.0.1';
    const vd = new Date(1612980455412);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
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

    const getDiceOfVal = (m) => {
        // expected syntax: !getDiceOfVal $[[0]] <=2|6-7|>10 total/count
        let [rollmarker, valparams, op = 'count'] = m.content.split(/\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceOfVal: wrong number of arguments, expected 3`); return; }
        const typeProcessor = {
            '!=': (r, t) => r != t,
            '>': (r, t) => r > t,
            '>=': (r, t) => r >= t,
            '<': (r, t) => r < t,
            '<=': (r, t) => r <= t,
            '-': (r, l, h) => r >= l && r <= h,
            '=': (r, t) => r == t
        };

        let roll = (/\$\[\[(\d+)]]/.exec(rollmarker) || ['', ''])[1];
        if (roll === '') return '0';
        let searchdicerx = /^((?<low>\d+)-(?<high>\d+))|((?<range>!=|>=|<=|>|<*)(?<singleval>\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchdicerx.exec(p);
            return res.groups.low ?
                {
                    test: '-',
                    params: [res.groups.low, res.groups.high]
                } :
                {
                    test: res.groups.range || '=',
                    params: [res.groups.singleval]
                };
        });
        let dice = (m.parsedinline[roll] || { getDice: () => [] }).getDice('included')
            .filter(d => {
                return tests.reduce((m, t) => {
                    return m || typeProcessor[t.test](d, ...t.params)
                }, false);
            });
        return op === 'count' ? dice.length : dice.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b));
    };

    on('ready', () => {
        versionInfo();
        logsig();
        try {
            APILogic.RegisterRule(getDiceOfVal);
        } catch (error) {
            log(`ERROR Registering APIL: ${error}`);
        }
    })

    return;
})();