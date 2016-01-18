import 'babel-polyfill'; // needed for generators
import { build, runEvent } from '../../src/source';
import { mousemove, keydown } from '../../src/dom';
import { map, sample, merge } from '../../src/event';
import { liftA2, step } from '../../src/signal';
import { newClock } from '../../src/clock';

const join = sep => (a, b) => a + sep + b;
const render = e => document.body.innerHTML = e;

const updates = build(function* (window) {
    const mouse = yield mousemove(window);
    const key = yield keydown(window);

    const coords = step('-,-', map(e => `${e.clientX},${e.clientY}`, mouse));
    const keyCode = step('-', map(e => e.keyCode, key));

    const s = liftA2(join(':'), coords, keyCode);

    return sample(s, merge(mouse, key));
}, window);

runEvent(render, updates, newClock(Date.now));
