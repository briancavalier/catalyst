import 'babel-polyfill'; // needed for generators
import { build, runEvent } from '../../src/source';
import { domEvent, inputValue } from '../../src/dom';
import { liftA2, map } from '../../src/signal';
import { sample } from '../../src/event';

const byId = id => document.getElementById(id);
const add = (x, y) => x + y;

const addInputs = build(function*(elx, ely, container) {
    const x = map(Number, inputValue(elx));
    const y = map(Number, inputValue(ely));
    const z = liftA2(add, x, y);

    const inputEvents = yield domEvent('input', container);

    return sample(z, inputEvents);

}, byId('x'), byId('y'), byId('container'));

const elz = byId('z');
const render = result => elz.value = result;

runEvent(render, addInputs, Date.now);
