/*
=========================================================
Name			:	DiscreteWhisper
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	.3
Last Update		:	10/23/2020
=========================================================

COMMAND LINE EXAMPLE:
!w --character|character|character any text {{aside|character|character}} more text {{Aside|character}} still more text

*/

const discretewhisper = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const vrs = '.2';
    const vd = new Date(1603484720519);
    const versionInfo = () => {
        log('\u0166\u0166 DiscreteWhisper v' + vrs + ', ' + vd.getFullYear() + '/' + (vd.getMonth() + 1) + '/' + vd.getDate() + ' \u0166\u0166');
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
    //		TABLES AND DEFINITIONS
    // ==================================================
    const msgtable = '<div style="width:100%;"><div style="border-radius:10px;border:2px solid #000000;background-color:__bg__; margin-right:16px; overflow:hidden;"><table style="width:100%; margin: 0 auto; border-collapse:collapse;font-size:12px;">__TABLE-ROWS__</table></div></div>';
    const msg1header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td></tr>';
    const msg1row = '<tr style="background-color:__bg__;"><td style="padding:4px;__row-css__">__cell1__</td></tr>';

    // ==================================================
    //		PROCESS
    // ==================================================
    const getTheSpeaker = function (msg) {
        var characters = findObjs({ type: 'character' });
        var speaking;
        characters.forEach((chr) => { if (chr.get('name') === msg.who) speaking = chr; });

        if (speaking) {
            speaking.speakerType = "character";
            speaking.localName = speaking.get("name");
        } else {
            speaking = getObj('player', msg.playerid);
            speaking.speakerType = "player";
            speaking.localName = speaking.get("displayname");
        }
        speaking.chatSpeaker = speaking.speakerType + '|' + speaking.id;

        return speaking;
    };
    const charFromAmbig = (info) => {                                       // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        character = findObjs({ type: 'character', id: info })[0] ||
            findObjs({ type: 'character' }).filter(c => c.get('name') === info)[0] ||
            findObjs({ type: 'character', id: (getObj("graphic", info) || { get: () => { return "" } }).get("represents") })[0];
        return character;
    };
    const msgbox = ({ c: c = "message", t: t = "DISCRETE WHISPER", btn: b = "buttons", sendas: sas = "API", wto: wto = "", bg: bg = "#dedede" }) => {
        const rowbg = ["#ffffff", "#dedede"];
        let tbl = msgtable.replace("__bg__", rowbg[0]);
        let hdr = msg1header.replace("__bg__", bg).replace("__cell1__", t);
        let row = msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", c);
        let btn = b !== "buttons" ? msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", b).replace("__row-css__", "text-align:right;margin:4px 4px 8px;") : "";
        let msg = tbl.replace("__TABLE-ROWS__", hdr + row + btn);
        if (wto) msg = `/w "${wto}" ${msg}`;
        sendChat(sas, msg);
    };

    const handleInput = (msg_orig) => {
        if (msg_orig.type !== 'api') return;
        if (!(/^!discrete\b/.test(msg_orig.content) || /^!w\b/.test(msg_orig.content))) return;

        let msg = msg_orig;
        let theSpeaker = getTheSpeaker(msg);

        let [characters, output, title] = msg.content.split(/\s+--/).slice(1);
        if (output.length === 0) {
            msgbox({ c: `No whispered message provided.`, t: `NO MESSAGE`, wto: theSpeaker.chatSpeaker });
            return;
        }
        output = `{{all}}${output}`;
        let undeliverable = [];
        let tempChar;
//        characters = characters.split('|');
        characters = [...new Set(characters.split('|'))]
            .map(c => {
                tempChar = charFromAmbig(c);
                if (!tempChar) undeliverable.push({ localName: c, whisper:'All'})
                return tempChar;
            })
            .filter(c => c);
        if (characters.length === 0) {
            msgbox({ c: `No valid characters provided.`, t: `NO MESSAGE`, wto: theSpeaker.chatSpeaker });
            return;
        }

        characters.forEach(c => { Object.assign(c, { whisper: '', localName: c.get('name') }) });

        let whisperrx = /{{(Aside\||aside\||all)(.*?)}}(.*?(?=(?:{{|$)))/g;
        // FROM   : {{aside|character|character2}}Whispered text.
        // group 1: aside|
        // group 2: character|character2
        // group 3: Whispered text.
        let aside;
        let asideCharacters = [];
        while (aside = whisperrx.exec(output)) {
            switch (aside[1]) {
                case "Aside|":
                    asideCharacters = [...new Set(aside[2].split('|'))];
                    characters.filter(c => asideCharacters.includes(c.localName))
                        .forEach(c => c.whisper = `${c.whisper.trim()}<br><b>Aside:</b> ${aside[3].trim()}`);
                    asideCharacters.filter(a => !characters.filter(c => c.localName === a).length)
                        .forEach(a => {
                            tempChar = undeliverable.filter(u => u.localName === a)[0];
                            if (tempChar) tempChar.whisper = `${tempChar.whisper}; ${aside[3]}`;
                            else undeliverable.push({ localName: a, whisper: aside[3] });
                        });
                    break;
                case "aside|":
                    asideCharacters = [...new Set(aside[2].split('|'))];
                    characters.filter(c => asideCharacters.includes(c.localName))
                        .forEach(c => c.whisper = `${c.whisper.trim()} ${aside[3].trim()}`);
                    asideCharacters.filter(a => !characters.filter(c => c.localName === a).length)
                        .forEach(a => {
                            tempChar = undeliverable.filter(u => u.localName === a)[0];
                            if (tempChar) tempChar.whisper = `${tempChar.whisper}; ${aside[3]}`;
                            else undeliverable.push({ localName: a, whisper: aside[3] });
                        });
                    break;
                case "all":
                    characters.forEach(c => c.whisper = `${c.whisper.trim()} ${aside[3].trim()}`);
                    break;
            }
        }

        if (title) {                                                        // title provided, so template the output
            characters.forEach(c => msgbox({ c: `${c.whisper}`, t: title, sas: theSpeaker.chatSpeaker, wto: c.localName }));
        } else {                                                            // no title provided, so simple output
            characters.forEach(c => sendChat(theSpeaker.chatSpeaker, `/w "${c.localName}" ${c.whisper}`));
        }

        // REPORT SENT MESSAGES
        let sent = characters.reduce((a, c) => {
            return `${a}<br><b>${c.localName}</b><br>${c.whisper}<br>`;
        }, '').slice(4);
        msgbox({ c: sent, t: 'DELIVERED WHISPERS', wto: `${theSpeaker.localName}` });

        // REPORT UNSENT MESSAGES
        if (undeliverable.length) {
            let unsent = undeliverable.reduce((a, c) => {
                return `${a}<br><b>${c.localName}</b><br>${c.whisper}<br>`;
            }, '').slice(4);
            msgbox({ c: unsent, t: 'UNDELIVERABLE ALERT', wto: `${theSpeaker.localName}`, bg: "#fdc6c6" });
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        versionInfo();
        logsig();
        registerEventHandlers();

    });

    return {
        // public interface
    };

})();

