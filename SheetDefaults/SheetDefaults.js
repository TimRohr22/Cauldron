on('ready', () => {
	on('chat:message', msg => {
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
			damage: 'd',

			default: ''
		}

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
		let args = msg.content
			.split(/\s+--/)
			.slice(1)
			.map(a => a.toLowerCase().split(/#|\|/))
			.filter(a => a.length < 2)
			.map(a => [propObj[a[0]] || propObj.default, ...a.slice(1)])
			.filter(a => a[0].length);

		let chars = findObjs({ type: 'character' });
		args.forEach(a => {
			if (!argOptions[a[0]].hasOwnProperty(a[1])) return;
			chars.forEach(c => {
				let attrs = findObjs({ type: 'attribute', characterid: c.id, name: `${a[0]}type` });
				if (attrs.length > 1) log(`Character ${c.get('name')} has ${attrs.length} attributes named ${a[0]}type.`);
				attrs.forEach((a, i) => {
					if (i === 0) a.set({ current: attrOptions[a[0]][a[1]] });
					else a.remove();
				});
			});

		});
	});
});