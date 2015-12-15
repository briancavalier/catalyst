import { fromDomEvent, fromValue } from '../../src/dom';
import { liftA2, map } from '../../src/signal';
import { sample, runEvent, newInput } from '../../src/event';

const input = newInput(Date.now);

const byId = id => document.getElementById(id);
const add = (x, y) => x + y;

const x = map(Number, fromValue(byId('x')));
const y = map(Number, fromValue(byId('y')));
const z = liftA2(add, x, y);

const result = byId('z');
const update = sample(z, fromDomEvent(input, 'input', byId('container')));

const render = e => result.value = e;

runEvent(render, update, Date.now());
