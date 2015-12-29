import 'babel-polyfill'; // needed for generators
import { build, runEvent } from '../../src/source';
import { fromDomEvent, fromInput } from '../../src/dom';
import { liftA2, map } from '../../src/signal';
import { sample } from '../../src/event';

const byId = id => document.getElementById(id);
const add = (x, y) => x + y;

const addInputs = build(function*(elx, ely, container) {
    const x = map(Number, fromInput(elx));
    const y = map(Number, fromInput(ely));
    const z = liftA2(add, x, y);

    const inputEvents = yield fromDomEvent('input', container);

    return sample(z, inputEvents);

}, byId('x'), byId('y'), byId('container'));

const elz = byId('z');
const render = result => elz.value = result;

runEvent(render, addInputs, Date.now);
