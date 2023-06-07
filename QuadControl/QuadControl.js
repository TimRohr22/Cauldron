/*
=========================================================
Name			:   QuadControl
GitHub			:   
Roll20 Contact  :   timmaugh
Version			:   1.0.0b2
Last Update		:   6/7/2023
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.QuadControl = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.QuadControl.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const QuadControl = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'QuadControl';
    const version = '1.0.0';
    const schemaVersion = 0.2; // TODO: Set back to 0.1 for production release
    const apilogo = 'https://i.imgur.com/HlgVjix.png';
    const apilogoalt = 'https://i.imgur.com/HlgVjix.png';
    API_Meta[apiproject].version = version;
    const vd = new Date(1686164976239);
    const versionInfo = () => {
        log(`\uD83C\uDFE0 ${apiproject} v${version} \uD83C\uDFE0 -- offset ${API_Meta[apiproject].offset}`);
    };
    const logsig = () => {
        state.houseofmod = state.houseofmod || {};
        state.houseofmod.siglogged = state.houseofmod.siglogged || false;
        state.houseofmod.sigtime = state.houseofmod.sigtime || Date.now() - 3001;
        if (
            !state.houseofmod.siglogged ||
            Date.now() - state.houseofmod.sigtime > 3000
        ) {
            const logsig =
                "\n" +
                "             ________________________               \n" +
                "           ／                 ______ ＼              \n" +
                "          ／                    _____ ＼             \n" +
                "         ／                       ____ ＼            \n" +
                "        ／______________________________＼           \n" +
                "             | _____          _____ |               \n" +
                "             | |_|_|    MOD   |_|_| |               \n" +
                "             | |_|_|   _____  |_|_| |               \n" +
                "             |         |   |        |               \n" +
                "             |         |  o|        |               \n" +
                "_____________|_________|___|________|_______________\n" +
                "                                                    \n";
            log(`${logsig}`);
            state.houseofmod.siglogged = true;
            state.houseofmod.sigtime = Date.now();
        }
        return;
    };

    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */

                case 0.2: // TODO: REMOVE PRIOR TO PRODUCTION RELEASE
                    state[apiproject] = {
                        settings: {
                            tokenShape: 'rotated', // rotated, straight, circle, point
                        },
                        defaults: {
                            tokenShape: 'rotated', // rotated, straight, circle, point
                        },
                        version: schemaVersion
                    }
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {
                            tokenShape: 'rotated', // rotated, straight, circle
                            tokenIntersection: 'edge', // edge or center
                        },
                        defaults: {
                            tokenShape: 'rotated', // rotated, straight, circle
                            tokenIntersection: 'edge', // edge or center
                        },
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

    const simpleObj = (o) => JSON.parse(JSON.stringify(o));

    // ==================================================
    //		MESSAGING
    // ==================================================
    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#5c9700',
        primaryTextColor: '#232323',
        primaryTextBackground: '#ededed'
    }
    const localCSS = {
        msgheader: {
            'background-color': theme.primaryColor,
            'color': 'white',
            'font-size': '1.2em',
            'padding-left': '4px'
        },
        msgbody: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgfooter: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgheadercontent: {
            'display': 'table-cell',
            'vertical-align': 'middle',
            'padding': '4px 8px 4px 6px'
        },
        msgheaderlogodiv: {
            'display': 'table-cell',
            'max-height': '30px',
            'margin-right': '8px',
            'margin-top': '4px',
            'vertical-align': 'middle'
        },
        logoimg: {
            'background-color': 'transparent',
            'float': 'left',
            'border': 'none',
            'max-height': '30px'
        },
        boundingcss: {
            'background-color': theme.primaryTextBackground
        },
        inlineEmphasis: {
            'font-weight': 'bold'
        }
    }
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        footercss: footercss = localCSS.msgfooter,
        sendas: sendas = 'QuadControl',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'QuadControl Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };

    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');
    const handleConfig = msg => {
        // expected command line: !qcconfig --tokenshape=circle
        if (msg.type !== 'api' || !/^!qcconfig/.test(msg.content)) return;
        let recipient = getWhisperTo(msg.who);
        if (!playerIsGM(msg.playerid)) {
            msgbox({ title: 'GM Rights Required', msg: 'You must be a GM to perform that operation', whisperto: recipient });
            return;
        }
        let message;
        let cfgTrack = {};
        let args = msg.content.split(/\s+--/).slice(1);
        if (args.length) {
            args.forEach((a, i) => {
                let [prop, value] = a.split('=');
                if (!(prop && value)) {
                    cfgTrack[`Unrecognized Arg (${i})`] = `QuadControl requires arguments in the format prop=value`;
                    return;
                }
                switch (prop.toLowerCase()) {
                    case 'tokenshape':
                        if (['rotated', 'straight', 'circle', 'point'].includes(value.toLowerCase())) {
                            manageState.set('tokenShape', value.toLowerCase());
                            cfgTrack.tokenShape = value.toLowerCase();
                        } else {
                            cfgTrack[`Unrecognized Arg (${i})`] = `QuadControl could not recognize value for ${prop}.`;
                        }
                        break;
                    default:
                        cfgTrack[`Unrecognized Arg (${i})`] = `QuadControl does not have a setting for ${prop}.`;
                }
            });
            let changes = Object.keys(cfgTrack).map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${cfgTrack[k]}`).join('<br>');
            msgbox({ title: `QuadControl Config Changed`, msg: `You have made the following changes to the QuadControl configuration:<br>${changes}`, whisperto: recipient });
        } else {
            cfgTrack.tokenShape = `${html.span('tokenShape', localCSS.inlineEmphasis)}: ${manageState.get('tokenShape')}`;
            message = `QuadControl is currently configured as follows:<br>${cfgTrack.tokenShape}`;
            msgbox({ title: 'QuadControl Configuration', msg: message, whisperto: recipient });
        }
    };

    // ==================================================
    //		QUADTREE IMPLEMENTATION
    // ==================================================
    let Rect = {}, Quadtree = {};

    // NEW RECT BUILDERS ================================
    const fromAura = (token, ai = '1') => {
        if (!['1', '2'].includes(ai)) { ai = '1'; }
        if (!token || isNaN(parseFloat(token.get(`aura${ai}_radius`)))) {
            return new Rect(0, 0, 0, 0);
        }
        let page = getObj('page', token.get('pageid'));
        let arad = parseFloat(token.get(`aura${ai}_radius`));
        let side = Math.max(token.get('height'), token.get('width'));
        let auraSide = side + (arad * (page.get('snapping_increment') / page.get('scale_number')) * 70 * 2);
        return new Rect(token.get('left'), token.get('top'), auraSide, auraSide);
    };
    const fromRadius = (source, r = 0) => {
        let tokenShape = manageState.get('tokenShape');
        let page = getObj('page', source.get('pageid'));
        let rangerx = /^(\d+?(?:\.\d+?)?)(u?)$/i;
        let range, res;
        if (rangerx.test(r)) {
            res = rangerx.exec(r);
            if (res[2]) { // given in units
                range = 70 * parseFloat(res[1]) * page.get('snapping_increment');
            } else {
                range = parseFloat(res[1]) * (page.get('snapping_increment') / page.get('scale_number')) * 70
            }
        } else {
            range = 0;
        }
        let radius;
        if (tokenShape !== 'point') {
            let side = Math.max(source.get('height'), source.get('width'));
            radius = (side / 2) + range;
        } else {
            radius = range;
        }
        return new Rect(source.get('left'), source.get('top'), 2 * radius, 2 * radius);
    };
    // NEW INTERSECTION SHAPE BUILDERS ================================
    const interAura = (token, ai = '1') => {
        if (!['1', '2'].includes(ai)) { ai = '1'; }
        if (!token || isNaN(parseFloat(token.get(`aura${ai}_radius`)))) {
            return new QCRect(0, 0, 0, 0);
        }
        let page = getObj('page', token.get('pageid'));
        let arad = parseFloat(token.get(`aura${ai}_radius`));
        let side = Math.max(token.get('height'), token.get('width'));
        let auraSide = side + (arad * (page.get('snapping_increment') / page.get('scale_number')) * 70 * 2);
        let shape;
        if (token.get(`aura${ai}_square`)) {
            shape = new QCRect(token.get('left'), token.get('top'), auraSide, auraSide);
        } else {
            shape = new QCCircle(token.get('left'), token.get('top'), auraSide / 2);
        }
        return shape;
    };
    const interToken = (token) => {
        if (token.get('subtype') === 'card') {
            return new QCRect(token.get('left'), token.get('top'), token.get('width'), token.get('height'), token.get('rotation'), false);
        }
        switch (manageState.get('tokenShape')) {
            case 'circle':
                return new QCCircle(token.get('left'), token.get('top'), Math.max(token.get('height'), token.get('width')) / 2);
                break;
            case 'straight':
                return new QCRect(token.get('left'), token.get('top'), token.get('width'), token.get('height'), 0);
                break;
            case 'rotated':
                return new QCRect(token.get('left'), token.get('top'), token.get('width'), token.get('height'), token.get('rotation'));
                break;
            case 'point':
                return new QCPoint(token.get('left'), token.get('top'));
                break;
        }
    };
    const interRadius = (source, r = 0) => {
        let tokenShape = manageState.get('tokenShape');
        let page = getObj('page', source.get('pageid'));
        let rangerx = /^(\d+?(?:\.\d+?)?)(u?)$/i;
        let range, res;
        if (rangerx.test(r)) {
            res = rangerx.exec(r);
            if (res[2]) { // given in units
                range = 70 * parseFloat(res[1]) * page.get('snapping_increment');
            } else {
                range = parseFloat(res[1]) * (page.get('snapping_increment') / page.get('scale_number')) * 70
            }
        } else {
            range = 0;
        }
        let radius;
        if (tokenShape !== 'point') {
            let side = Math.max(source.get('height'), source.get('width'));
            radius = (side / 2) + range;
        } else {
            radius = range;
        }
        return new QCCircle(source.get('left'), source.get('top'), radius);
    };
    const interPath = (path) => {
        return new QCPath(path.get('left'), path.get('top'), path.get('height'), path.get('width'), path.get('path'));
    };
    const interText = (text) => {
        return new QCRotatedRect(text.get('left'), text.get('top'), text.get('width'), text.get('height'), text.get('rotation'), false);
    };

    const treeMap = {};
    /*
    const retrieveFilters = {
        token: o => o.get('type') === 'graphic' && o.get('subtype') === 'token',
        card: o => o.get('type') === 'graphic' && o.get('subtype') === 'card',
        graphic: o => o.get('type' === 'graphic'),
        path: o => o.get('type') === 'path',
        text: o => o.get('type') === 'text',
        // TODO : finish aura filter (where potential match must have an aura) -- make it for individual auras or any... aura: o => o.get('aura')
        gmlayer: o => o.get('layer') === 'gmlayer',
        objects: o => o.get('layer') === 'objects',
        walls: o => o.get('layer') === 'walls',
        map: o => o.get('layer') === 'map'
    };
    */
    const rectFuncs = {
        aura: fromAura,
        radius: fromRadius
    };
    const buildlibTypeComponents = () => {
        Rect = libTypes.Rect;
        Quadtree = libTypes.Quadtree;
        rectFuncs.graphic = Rect.fromGraphic;
        rectFuncs.path = Rect.fromPath;
        rectFuncs.text = Rect.fromText;
    };
    const defaultConfig = { maxObjects: 10, maxDepth: 4 };
    const buildTree = (page, config, pgburndown, startTime) => {
        let qtree = new Quadtree(Rect.fromPage(page), config);
        let queue = typesToTrack.reduce((m, t) => {
            m = [...m, ...findObjs({ type: t, pageid: page.id })];
            return m;
        }, []);
        const burndown = () => {
            let o = queue.shift();
            if (o) {
                qtree.insert(rectFuncs[o.get('type')](o), o);
                setTimeout(burndown, 0);
            } else {
                log(`...finished building ${page.get('name')} (elapsed time: ${(Date.now() - startTime) / 1000} seconds)`);
                treeMap[page.id] = qtree;
                pgburndown();
            }
        }
        burndown();
    };

    // ==================================================
    //	    INTERFACE COMPONENTS
    // ==================================================
    let typesToTrack = [];
    const trackType = (...types) => {
        let setOfAll = ['graphic', 'path', 'text'];
        typesToTrack = [...new Set([
            ...typesToTrack,
            ...types
                .map(t => t.toLowerCase())
                .filter(t => [...setOfAll, 'all'].includes(t))
        ])];
        if (typesToTrack.includes('all')) {
            typesToTrack = [...setOfAll];
        }
    };

    const retrieve = ({ source: s = '', type, from/*, ...filters*/ } = {}) => {
        const nullObj = { get: () => undefined };
        let source = (typeof s !== 'string' && s) || findObjs({ id: s })[0] || nullObj;
        let pageid = source.get('pageid');
        if (!(source.id && pageid && treeMap.hasOwnProperty(pageid) && rectFuncs.hasOwnProperty(type || source.get('type')))) {
            // TODO: Send notice of no source
            log(`QC Retrieve has no source`);
            return [];
        }
        type = type && rectFuncs.hasOwnProperty(type)
            ? type
            : source.get('type');
        let ret = treeMap[pageid].retrieve(rectFuncs[type](source, from))
            .map(e => e.context);
        /*
        let activeFilters = filters.length
            ? filters.map(f => retrieveFilters[f]).filter(f => f !== undefined)
            : [];
        if (activeFilters.length) {
            ret = ret.filter(e => activeFilters.some(f => f(e.context)));
        }
        */
        return ret;
    };

    const intersections = ({ source: s = '', type, from/*, ...filters*/ } = {}) => {
        const nullObj = { get: () => undefined };
        const interShapes = {
            aura: interAura,
            graphic: interToken,
            path: interPath,
            text: interText,
            radius: interRadius
        };
        let source = (typeof s !== 'string' && s) || findObjs({ id: s })[0] || nullObj;
        let pageid = source.get('pageid');
        if (!(source.id && pageid && treeMap.hasOwnProperty(pageid) && rectFuncs.hasOwnProperty(type || source.get('type')))) {
            // TODO: Send notice of no source
            log(`QC Retrieve has no source`);
            return [];
        }
        type = type && interShapes.hasOwnProperty(type)
            ? type
            : source.get('type');
        let potentials = retrieve({ source: source, type: type, from: from/*, ...filters*/ });
        if (!potentials.length) { return [] };
        let sourceShape = interShapes[type](source, from);
        return potentials.filter(p => {
            return sourceShape.intersect(interShapes[p.get('type')](p));
        });
    }

    // ==================================================
    //		COLLISION DETECTION ENGINE
    // ==================================================

    // CLASSES ==========================================
    class QCPoint {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        intersect(shape) {
            switch (shape.constructor.name) {
                case 'QCRect': return overlapRectPoint(shape, this);
                case 'QCCircle': return overlapCirclePoint(shape, this);
                case 'QCPath': return overlapPathPoint(shape, this);
                case 'QCPoint': return overlapPointPoint(this, shape);
            }
        }
    }

    class QCRect {
        constructor(left, top, width, height, degrees = 0, as_square = true) {
            let angle = (degrees * Math.PI / 180) % 360;
            let c = Math.cos(angle);
            let s = Math.sin(angle);
            if (as_square) {
                this.width = Math.max(height, width);
                this.height = this.width;
            } else {
                this.height = height;
                this.width = width;
            }
            let halfWidth = this.width / 2;
            let halfHeight = this.height / 2;

            this.center = new QCPoint(left, top);
            this.degrees = degrees;
            this.radians = angle;
            this.corners = [
                new QCPoint(left - (halfWidth * c) - (halfHeight * s), top - (halfWidth * s) + (halfHeight * c)),
                new QCPoint(left + (halfWidth * c) - (halfHeight * s), top + (halfWidth * s) + (halfHeight * c)),
                new QCPoint(left + (halfWidth * c) + (halfHeight * s), top + (halfWidth * s) - (halfHeight * c)),
                new QCPoint(left - (halfWidth * c) + (halfHeight * s), top - (halfWidth * s) - (halfHeight * c))
            ];
            this.sides = this.corners.map((c, i, a) => [{ ...this.corners[i] }, { ...this.corners[a[i + 1] ? i + 1 : 0] }]);
        }
        intersect(shape) {
            switch (shape.constructor.name) {
                case 'QCRect': return overlapRectRect(this, shape);
                case 'QCCircle': return overlapRectCircle(this, shape);
                case 'QCPath': return overlapRectPath(this, shape);
                case 'QCPoint': return overlapRectPoint(this, shape);
            }
        }
    }
    class QCCircle {
        constructor(left, top, radius) {
            this.center = new QCPoint(left, top);
            this.radius = radius;
            this.sqradius = radius ** 2;
        }
        intersect(shape) {
            switch (shape.constructor.name) {
                case 'QCRect': return overlapRectCircle(shape, this);
                case 'QCCircle': return overlapCircleCircle(this, shape);
                case 'QCPath': return overlapCirclePath(this, shape);
                case 'QCPoint': return overlapCirclePoint(this, shape);
            }
        }
    }
    class QCPath {
        constructor(left, top, height, width, pathstring) {
            this.path = JSON.parse(pathstring);
            this.center = new QCPoint(left, top);
            this.height = height;
            this.width = width;
            this.topleft = new QCPoint(this.center.x - (this.width * .5), this.center.y - (this.height * .5));
            if (this.path[this.path.length - 1][0] === 'Z') {
                this.closed = true;
                this.path.pop();
            } else {
                this.closed = false;
            }
            this.corners = this.path.map(p => new QCPoint(Number(this.topleft.x) + Number(p[1]), Number(this.topleft.y) + Number(p[2])));
            this.sides = this.corners.map((c, i, a) => [{ ...this.corners[i] }, { ...this.corners[a[i + 1] ? i + 1 : 0] }]);
            this.sides.pop();
        }
        intersect(shape) {
            switch (shape.constructor.name) {
                case 'QCRect': return overlapRectPath(shape, this);
                case 'QCCircle': return overlapCirclePath(shape, this);
                case 'QCPath': return overlapPathPath(this, shape);
                case 'QCPoint': return overlapPathPoint(this, shape);
            }
        }
    }

    // POINT / POLY OPERATIONS ==========================
    const closestPointOnSegment = (segA, segB, P) => {
        const output = (p) => {
            return {
                point: p,
                sqdistance: (p.x - P.x) ** 2 + (p.y - P.y) ** 2
            };
        };

        const A = P.x - segA.x,
            B = P.y - segA.y,
            C = segB.x - segA.x,
            D = segB.y - segA.y

        const segLenSq = C ** 2 + D ** 2
        const t = (segLenSq != 0) ? (A * C + B * D) / segLenSq : -1

        return (t < 0)
            ? output(segA)
            : (t > 1)
                ? output(segB)
                : output({
                    x: segA.x + t * C,
                    y: segA.y + t * D
                });
    };
    const intersects = (A, B, C, D) => {
        let epsilon = 1e-5;
        let det, gamma, lambda;
        det = (B.x - A.x) * (D.y - C.y) - (D.x - C.x) * (B.y - A.y);
        if (det === 0) {
            return pointOnSegment(A, C, D) ||
                pointOnSegment(B, C, D) ||
                pointOnSegment(C, A, B) ||
                pointOnSegment(D, A, B);
        } else {
            lambda = ((D.y - C.y) * (D.x - A.x) + (C.x - D.x) * (D.y - A.y)) / det;
            gamma = ((A.y - B.y) * (D.x - A.x) + (B.x - A.x) * (D.y - A.y)) / det;
            return (-epsilon < lambda && lambda < 1 + epsilon) && (-epsilon < gamma && gamma < 1 + epsilon);
        }
    };
    const pointOnSegment = (p, s1, s2) => {
        if (s1.x === s2.x && p.x === s1.x && clampCoordinate(p, s1, s2)) {
            return true;
        }
        let m = (s1.y - s2.y) / (s1.x - s2.x);
        let b = s1.y - (m * s1.x);
        return p.y === m * p.x + b && clampCoordinate(p, s1, s2);
    };
    const clampCoordinate = (p, s1, s2) => {
        return p.x >= Math.min(s1.x, s2.x) && p.x <= Math.max(s1.x, s2.x) &&
            p.y >= Math.min(s1.y, s2.y) && p.y <= Math.max(s1.y, s2.y);
    };
    const closestPointOnPoly = (poly, point) => {
        return poly.sides
            .map(s => closestPointOnSegment(...s, point))
            .sort((a, b) => a.sqdistance < b.sqdistance ? -1 : 1)
            .shift();
    };
    const pointInPoly = (poly, point) => {
        // if we have eliminated side intersection and we know it is a convex shape
        // we can test the center with a single ray,looking for an odd number of intersections
        let rayPoint = new QCPoint(point.x, Math.min(...poly.corners.map(c => c.y)) - 1);
        let intersections = poly.sides.reduce((m, s) => {
            if (intersects(rayPoint, point, s[0], s[1])) {
                m++;
            }
            return m;
        }, 0);
        return intersections % 2 === 1;
    };
    // COLLISION FUNCTIONS ==============================
    const overlapRectRect = (rect1, rect2) => {
        return pointInPoly(rect1, rect2.center) ||
            pointInPoly(rect2, rect1.center) ||
            rect1.sides.some(side1 => {
                return rect2.sides.some(side2 => {
                    return intersects(...side1, ...side2);
                });
            });
    };
    const overlapRectCircle = (rect, circle) => {
        let p = closestPointOnPoly(rect, circle.center);
        if (p.sqdistance <= circle.sqradius) {
            return true;
        }
        return pointInPoly(rect, circle.center);
    };
    const overlapRectPath = (rect, path) => {
        if (path.closed && (pointInPoly(rect, path.center) || pointInPoly(path, rect.center))) {
            return true;
        }
        return rect.sides.some(side1 => {
            return path.sides.some(side2 => {
                return intersects(...side1, ...side2);
            });
        });
    };
    const overlapRectPoint = (rect, point) => {
        return pointInPoly(rect, point);
    };
    const overlapCircleCircle = (circle1, circle2) => {
        return ((circle1.center.x - circle2.center.x) ** 2 + (circle1.center.y - circle2.center.y) ** 2 <= (circle1.radius + circle2.radius) ** 2);
    };
    const overlapCirclePath = (circle, path) => {
        if (path.closed && pointInPoly(path, circle.center)) {
            return true;
        }
        let p = closestPointOnPoly(path, circle.center);
        if (p.sqdistance <= circle.sqradius) {
            return true;
        }
        return false;
    };
    const overlapCirclePoint = (circle, point) => {
        return ((circle.center.x - point.x) ** 2 + (circle.center.y - point.y) ** 2 <= circle.sqradius);
    };
    const overlapPathPath = (path1, path2) => {
        if (path1.closed && path2.closed && (pointInPoly(path1, path2.center) || pointInPoly(path2, path1.center))) {
            return true;
        }
        return path1.sides.some(side1 => {
            return path2.sides.some(side2 => {
                return intersects(...side1, ...side2);
            });
        });
    };
    const overlapPathPoint = (path, point) => {
        if (path.closed) {
            return pointInPoly(path, point);
        } else {
            return path.sides.some(s => {
                return pointOnSegment(point, ...s);
            });
        }
    };
    const overlapPointPoint = (point1, point2) => {
        return point1.x === point2.x && point1.y === point2.y;
    };

    // ==================================================
    //		HANDLERS
    // ==================================================
    const handleInput = (msg) => {
        if ('api' !== msg.type || !/^!qc$/i.test(msg.content)) return;
        log(`Key Count: ${Object.keys(treeMap).length}`);
        log(Object.keys(treeMap).join('   ,   '));
    };
    const handleGraphicChange = (o, p) => {
        if (['top', 'left', 'height', 'width', 'rotation', 'layer'].some(prop => o.get(prop) !== p[prop])) {
            treeMap[o.get('pageid')].remove(e => e.id === o.id);
            treeMap[o.get('pageid')].insert(Rect.fromGraphic(o), o);
        }
    };
    const handleDestroyGraphic = (o) => {
        treeMap[o.get('pageid')].remove(e => e.id === o.id);
    };
    const handleAddGraphic = (o) => {
        treeMap[o.get('pageid')].insert(Rect.fromGraphic(o), o);
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('chat:message', handleConfig);
        on('change:graphic', handleGraphicChange);
        on('destroy:graphic', handleDestroyGraphic);
        on('add:graphic', handleAddGraphic);
        if (TokenMod) {
            TokenMod.ObserveTokenChange(handleGraphicChange);
        }
    };
    let ready = false;
    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            const versionCheck = (mv, rv) => {
                let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                return reqv.reduce((m, v, i) => {
                    if (m.pass || m.fail) return m;
                    if (i < 3) {
                        if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
                        else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
                    } else {
                        // all betas are considered below the release they are attached to
                        if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
                        else if (modv[i] === 0) m.pass = true;
                        else if (reqv[i] === 0) m.fail = true;
                        else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
                    }
                    return m;
                }, { pass: false, fail: false }).pass;
            };

            let result = { passed: true, failures: {}, optfailures: {} };
            deps.forEach(d => {
                let failObj = d.optional ? result.optfailures : result.failures;
                if (!d.mod) {
                    if (!d.optional) result.passed = false;
                    failObj[d.name] = 'Not found';
                    return;
                }
                if (d.version && d.version.length) {
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        if (!d.optional) result.passed = false;
                        failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        if (!d.optional) m.passed = false;
                        failObj[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        let failures = '', contents = '', msg = '';
        if (Object.keys(depCheck.optfailures).length) { // optional components were missing
            failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/HlgVjix.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/HlgVjix.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };
    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
        let reqs = [
            {
                name: 'Messenger',
                version: `1.0.0`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
            },
            {
                name: 'libTypes',
                version: `0.1.0`,
                mod: typeof libTypes !== 'undefined' ? libTypes : undefined,
                checks: [['Rect', 'function'], ['Quadtree', 'function']]
            }

        ];
        if (!checkDependencies(reqs)) return;
        html = Messenger.Html();
        css = Messenger.Css();
        HE = Messenger.HE;

        registerEventHandlers();
        buildlibTypeComponents();
        setTimeout(() => {
            let queue = findObjs({ type: 'page' });
            let startTime = Date.now();
            const burndown = () => {
                let p = queue.shift();
                if (p) {
                    log(`QuadControl is building ${p.get('name')}`);
                    setTimeout(buildTree, 0, p, defaultConfig, burndown, Date.now());
                } else {
                    log(`QuadControl is ready (elapsed time: ${(Date.now() - startTime) / 1000} seconds)`);
                    ready = true;
                }
            };
            burndown();
        }, 0);
    });
    return {
        TrackType: trackType,
        Retrieve: retrieve,
        Intersections: intersections,
        Ready: ready
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.QuadControl.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.QuadControl.offset); } }
/* */
