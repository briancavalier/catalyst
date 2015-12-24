import 'babel-polyfill'; // needed for generators
import { build, runSource } from '../../src/source';
import { fromDomEvent } from '../../src/dom';
import { map, sample, merge } from '../../src/event';
import { liftA2, step } from '../../src/signal';

const join = sep => (a, b) => a + sep + b;

const n = build(function* () {
    const mouse = yield fromDomEvent('mousemove', window);
    const keydown = yield fromDomEvent('keydown', window);

    const coords = step('hi', map(e => `${e.clientX},${e.clientY}`, mouse));
    const keyCode = step(0, map(e => e.keyCode, keydown));

    const s = liftA2(join(':'), coords, keyCode);

    return sample(s, merge(mouse, keydown));
});

runSource(e => document.body.innerHTML = e, n, Date.now);
