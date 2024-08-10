/*
=========================================================
Name            :   SheetDefaults
GitHub          :   
Roll20 Contact  :   timmaugh
Version         :   1.0.0
Last Update     :   8/10/2024
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.SheetDefaults = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.SheetDefaults.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const SheetDefaults = (() => { // eslint-disable-line no-unused-vars
	const apiproject = 'SheetDefaults';
	const version = '1.0.0';
	const schemaVersion = 0.1;
	API_Meta[apiproject].version = version;
	const vd = new Date(1723316966114);
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
	//		LOGGING
	// ==================================================
	let oLog = {};
	const resetLog = () => {
		oLog = {
			w: {
				create: [],
				delete: []
			},
			r: {
				create: [],
				delete: []
			},
			d: {
				create: [],
				delete: []
			},
			args: []
		}
	}

	// ==================================================
	//		HANDLE INPUT
	// ==================================================
	const handleInput = (msg) => {
		if (msg.type !== 'api' || !/^!sheetdefaults\s/i.test(msg.content)) return;
		if (!playerIsGM(msg.playerid)) {
			sendChat('Script Moderator', 'GM access required to run that command.');
			return;
		}
		const propObj = {
			w: 'w',
			wtype: 'w',
			whisper: 'w',

			r: 'r',
			rtype: 'r',
			roll: 'r',

			d: 'd',
			dtype: 'd',
			damage: 'd'
		};

		const attrOptions = {
			w: {
				always: '/w gm ',
				never: '',
				toggle: '@{whispertoggle}',
				query: '?{Whisper?|Public Roll,|Whisper Roll,/w gm }'
			},
			r: {
				always: '{{always=1}} {{r2=[[1d20',
				never: '{{normal=1}} {{r2=[[0d20',
				toggle: '@{advantagetoggle}',
				query: '@{queryadvantage}'
			},
			d: {
				auto: 'full',
				yes: 'full',
				no: 'pick'
			}
		};
		let argObj = Object.fromEntries(
			msg.content
				.split(/\s+--/)
				.slice(1)
				.map(a => a.toLowerCase().split(/#|\|/))
				.filter(a => a.length > 1)
				.map(a => a.slice(0, 2))
				.filter(a => propObj.hasOwnProperty(a[0]) && attrOptions[propObj[a[0]]].hasOwnProperty(a[1]))
				.map(a => [propObj[a[0]], attrOptions[propObj[a[0]]][a[1]]])
		);
		if (!Object.keys(argObj).length) { return; }
		resetLog();
		oLog.args = Object.keys(argObj);
		let oData = findObjs({ type: 'character' })
			.reduce((m, c) => {
				Object.keys(argObj).forEach(k => {
					let attrs = findObjs({ type: 'attribute', characterid: c.id, name: `${k}type` });
					if (!attrs.length) {
						m = [
							...m,
							{ action: 'create', cid: c.id, aid: '', name: `${k}type`, current: argObj[k] }
						];
						oLog[k].create.push(c.id);
					} else {
						m = [
							...m,
							{ action: 'change', cid: c.id, aid: attrs[0].id, name: `${k}type`, current: argObj[k] },
							...attrs.slice(1).map(a => {
								return { action: 'delete', cid: c.id, aid: a.id, name: `${k}type`, current: argObj[k] };
							})
						];
						if (attrs.length > 1) {
							oLog[k].delete.push(c.id);
						}
					}
				});
				return m;
			}, []);

		burndown(oData);
	};
	const outputLog = () => {
		let output = oLog.args.map(a => {
			return `{{${a.toLowerCase()}type=**Created** ${oLog[a].create.length}%NEWLINE%**Deleted** ${oLog[a].delete.length}}}`;
		});
		sendChat(`SheetDefaults`, `/w gm &{template:default} {{name=Sheet Defaults Log}} ${output}`);
	}
	const burndown = (oData) => {
		if (!oData.length) {
			outputLog();
			return;
		}
		let data = oData.shift();
		let attr;
		switch (data.action) {
			case 'create':
				createObj('attribute', { characterid: data.cid, name: data.name, current: data.current });
				break;
			case 'delete':
				attr = findObjs({ type: 'attribute', id: data.aid })[0];
				if (attr) { attr.remove() }
				break;
			default:
				attr = findObjs({ type: 'attribute', id: data.aid })[0];
				if (attr) { attr.set({ current: data.current }); }
		}
		setTimeout(burndown, 0, oData);
	}

	const registerEventHandlers = () => {
		on('chat:message', handleInput);
	};

	on('ready', () => {
		versionInfo();
		assureState();
		logsig();
		registerEventHandlers();
		resetLog();
	});
	return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.SheetDefaults.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.SheetDefaults.offset); } }
/* */