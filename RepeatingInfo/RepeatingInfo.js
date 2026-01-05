/*
=========================================================
Name            :   RepeatingInfo
GitHub          :   
Roll20 Contact  :   timmaugh
Version         :   1.0.0
Last Update     :   7/13/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.RepeatingInfo = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.RepeatingInfo.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const RepeatingInfo = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'RepeatingInfo';
    const version = '1.0.0';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1655476169424);
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
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {},
                        defaults: {},
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

    // ==================================================
    //		UTILITIES
    // ==================================================
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');
    const myChars = (pid) => {
        let charsIControl = findObjs({ type: 'character' });
        return playerIsGM(pid) ? charsIControl : charsIControl.filter(c => {
            return c.get('controlledby').split(',').reduce((m, p) => {
                return m || p === 'all' || p === pid;
            }, false)
        });
    };
    const getChar = (query, pid) => { // find a character where query is an identifying piece of information (id, name, or token id)
        let character;
        if (typeof query !== 'string') return character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = myChars(pid);
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => {
                qrx.lastIndex = 0;
                return qrx.test(c.get('name'));
            })[0];
        return character;
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        /*
        * !rptginfo --char[|#=]<char ref> --list|<listname, def: attack>|<naming sub attr, def: atkname> --output|<menu or text>
        */
        if (msg.type !== 'api' || !/^!rptginfo\b/.test(msg.content)) { return; }

        let argObj = {
            char: undefined, // Roll20 character object
            list: 'attack',
            subattr: 'atkname',
            output: 'text'
        };

        let args = msg.content.split(/\s+--/).slice(1)
            .map(a => a.trim()
                .split(/^([^\s|\||#|=]+)(?:\s|\||#|=)/)
                .filter((p, i) => i > 0 || (p && p.length))
            );

        let charsIControl = myChars(msg.playerid);
        let cicIDs = charsIControl.map(c => c.id);
        let rptAttrs = findObjs({ type: 'attribute' })
            .filter(a => cicIDs.includes(a.get('characterid')) && /^repeating_/.test(a.get('name')));

        if (!args.length) {
            let listsISee = {};
            rptAttrs.forEach(a => {
                let [_full, listname, rowID, subattr] = /^repeating_([^_]+?)_([^_]+?)_(.+)$/.exec(a.get('name'));
                listsISee[listname] = listsISee[listname] || [];
                listsISee[listname].push(subattr);
            });
            Object.keys(listsISee).forEach(k => {
                listsISee[k] = [...new Set(listsISee[k])].sort((a, b) => a < b ? -1 : 1);
            });
            let argChar = `--char|?{Character|${charsIControl.sort((a, b) => a.get('name') < b.get('name') ? -1 : 1).map(c => c.get('name') + ',' + c.id).join('|')}}`;
            let argList = `--list|?{List|${Object.keys(listsISee).sort((a, b) => a < b ? -1 : 1).map(k => `${k},${k}&amp;vert;?{Naming Sub Attr&amp;vert;${listsISee[k].join('&amp;vert;')}&amp;rbrace;`).join('|')}}`;
            sendChat('API', `/w ${getWhisperTo(msg.who)} [Get Info For](!rptginfo ${argChar} ${argList} --output|?{Output|template|text})`, null, { noarchive: true });
            return;
        }
        args.forEach(a => {
            switch (a[0]) {
                case 'char':
                    argObj.char = getChar(a[1], msg.playerid) || argObj.char;
                    break;
                case 'list':
                    [argObj.list, argObj.subattr] = a[1].split(/^([^\s|\||#]+)(?:\s|\||#)/)
                        .filter((p, i) => i > 0 || (p && p.length));
                    break;
                case 'output':
                    if (['text', 'menu', 'template'].includes(a[1].toLowerCase())) {
                        argObj.output = a[1].toLowerCase() === 'text' ? 'text' : 'menu';
                    }
                    break;
                default:
            }
        });

        // quality checks
        if (!(argObj.char && argObj.char.id && argObj.list && argObj.list.length && argObj.subattr && argObj.subattr.length)) {
            sendChat('API', `/w ${getWhisperTo(msg.who)} &{template:default} {{name=Invalid Argument Set}} ` +
                `{{=One or more arguments is missing or invalid.}}` +
                `{{Character=${argObj.char && argObj.char.id ? `${argObj.char.get('name')} (${argObj.char.id})` : 'not found'}}}` +
                `{{List=${argObj.list && argObj.list.length ? argObj.list : 'not found'}}}` +
                `{{Sub Attr=${argObj.subattr && argObj.subattr.length ? argObj.subattr : 'not found'}}}`, null, { noarchive: true }
            );
            return;
        }
        rptAttrs = rptAttrs.filter(a => a.get('characterid') === argObj.char.id && /^repeating_([^_]+?)_([^_]+?)_(.+)$/.exec(a.get('name'))[1] === argObj.list);
        if (!rptAttrs.length) {
            sendChat('API', `/w ${getWhisperTo(msg.who)} &{template:default} {{name=Invalid Argument Set}} ` +
                `{{=That list does not exist for this character. Click this button to generate a new starting command line:%NEWLINE%[Start](!rptginfo)}}`,
                null, { noarchive: true });
            return;
        }
        let subList = rptAttrs.filter(a => /^repeating_([^_]+?)_([^_]+?)_(.+)$/.exec(a.get('name'))[3] === argObj.subattr);
        if (!subList.length) {
            sendChat('API', `/w ${getWhisperTo(msg.who)} &{template:default} {{name=No Such Naming Attribute}} ` +
                `{{=No attributes found with that sub attribute name.}}` +
                `{{Sub Attr=${argObj.subattr}}}`, null, { noarchive: true });
            return;
        }

        // output
        sendChat('API', `/w ${getWhisperTo(msg.who)} &{template:default} {{name=Repeating Info for ${argObj.char.get('name')}/${argObj.list}}} ` +
            subList.map(a => `{{${a.get('current')}=${/^repeating_([^_]+?)_([^_]+?)_(.+)$/.exec(a.get('name'))[2]}}}`).join('')
        );
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

{ try { throw new Error(''); } catch (e) { API_Meta.RepeatingInfo.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.RepeatingInfo.offset); } }
