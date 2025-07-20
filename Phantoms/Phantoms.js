/* */
var API_Meta = API_Meta || {};
API_Meta.PhantomID = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.PhantomID.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4)); } }

on('ready', () => {
    on('chat:message', msg => {
        if (msg.type !== 'api' || !/^!phantom/.test(msg.content)) { return; }
        let rxAll = new RegExp(`(${getAllObjs().map(o => o.id).join('|')})`, '');

        let characters = findObjs({ type: 'character' })
            .reduce((m, c) => {
                let phantoms = [];
                ['controlledby', 'inplayerjournals'].forEach(prop => {
                    c.get(prop).split(/\s*,\s*/)
                        .filter(p => p.toLowerCase() !== 'all' && p.trim().length)
                        .forEach(p => {
                            if (!rxAll.test(p)) { phantoms.push(p); }
                        });
                });

                if (phantoms.length) { m[c.id] = { object: c, phantoms: [...new Set(phantoms)] }; }
                return m;
            }, {});

        let allTokens = findObjs({ type: 'graphic', subtype: 'token' });
        let tokensMissingCharacters = allTokens.filter(t => t.get('represents').length && !rxAll.test(t.get('represents')))
            .reduce((m, t) => {
                let phantoms = [];
                ['controlledby'].forEach(prop => {
                    t.get(prop).split(/\s*,\s*/)
                        .filter(p => p.toLowerCase() !== 'all' && p.trim().length)
                        .forEach(p => {
                            if (!rxAll.test(p)) { phantoms.push(p); }
                        });
                });
                if (phantoms.length) { m[t.id] = { object: t, phantoms: [...new Set(phantoms)] }; }
                return m;
            }, {});
        let tokens = allTokens.filter(t => !t.get('represents').length)
            .reduce((m, t) => {
                let phantoms = [];
                ['controlledby'].forEach(prop => {
                    t.get(prop).split(/\s*,\s*/)
                        .filter(p => p.toLowerCase() !== 'all' && p.trim().length)
                        .forEach(p => {
                            if (!rxAll.test(p)) { phantoms.push(p); }
                        });
                });
                if (phantoms.length) { m[t.id] = { object: t, phantoms: [...new Set(phantoms)] }; }
                return m;
            }, {});

        let pageLib = findObjs({ type: 'page' }).reduce((m, p) => m[p.id] = p.get('name'));

        log(`===================================`);
        log(`  GAME REPORT`);
        log(`===================================`);
        log(`  == CHARACTERS WITH PHANTOMS`);
        for (const [key, value] of Object.entries(characters)) {
            log(`    ${value.object.get('name')} (${key}) ==> ${value.phantoms.join(',')}`);
        }
        log(`  == TOKENS WITH MISSING CHARACTERS`);
        for (const [key, value] of Object.entries(tokensMissingCharacters)) {
            log(`    ${value.object.get('name')} (${key}) ==> (${value.object.get('left')}, ${value.object.get('top')}, ${value.object.get('layer')}, ${pageLib[value.object.get('pageid')]})`);
            log(`      Represents: ${value.object.get('represents')}`);
            if (value.phantoms.length) { log(`      Phantoms: ${value.phantoms.join(',')}`); }
        }
        log(`  == TOKENS WITH PHANTOMS`);
        for (const [key, value] of Object.entries(tokens)) {
            log(`    ${value.object.get('name')} (${key}) ==> (${value.object.get('left')}, ${value.object.get('top')}, ${value.object.get('layer')}, ${pageLib[value.object.get('pageid')]})`);
            log(`      Phantoms: ${value.phantoms.join(',')}`);
        }
    });
});
{ try { throw new Error(''); } catch (e) { API_Meta.PhantomID.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.PhantomID.offset); } }
/* */