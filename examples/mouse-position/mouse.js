import { fromDomEvent } from '../../src/dom';
import { map, runEvent, sample, merge, newInput } from '../../src/event';
import { liftA2, step } from '../../src/signal';

const input = newInput(Date.now);
//const input = newInput(() => window.performance.now());

//let t = 0;
//const input = newInput(() => t += 1);

const mouse = fromDomEvent(input, 'mousemove', window);
const keydown = fromDomEvent(input, 'keydown', window);

// Turn mouse position and key code into continuous signals
// Format the mouse position and key code for display
const coords = step('hi', map(e => `${e.clientX},${e.clientY}`, mouse));
const keyCode = step(0, map(e => e.keyCode, keydown));

// Join them into a string
const join = sep => (a, b) => a + sep + b;
const s = liftA2(join(':'), coords, keyCode);

runEvent(e => document.body.innerHTML = e, sample(s, merge(mouse, keydown)), Date.now());

