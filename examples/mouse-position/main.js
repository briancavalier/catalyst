import 'babel-polyfill'; // needed for generators
import { build, runEvent } from '../../src/source';
import { domEvent } from '../../src/dom';
import { map, sample, merge } from '../../src/event';
import { liftA2, step } from '../../src/signal';
import { newClock } from '../../src/clock';

const join = sep => (a, b) => a + sep + b;
const render = e => document.body.innerHTML = e;

const updates = build(function* (window) {
    const mouse = yield domEvent('mousemove', window);
    const keydown = yield domEvent('keydown', window);

    const coords = step('-,-', map(e => `${e.clientX},${e.clientY}`, mouse));
    const keyCode = step('-', map(e => e.keyCode, keydown));

    const s = liftA2(join(':'), coords, keyCode);

    return sample(s, merge(mouse, keydown));
}, window);

runEvent(render, updates, newClock(Date.now));
