import 'babel-polyfill'; // needed for generators
import { build, runSource } from '../../src/source';
import { fromDomEvent, fromInput } from '../../src/dom';
import { map, merge, scan, rest, sample } from '../../src/event';
import { step, liftA2, map as mapSignal } from '../../src/signal';
import snabbdom from 'snabbdom';
import h from 'snabbdom/h';

const patch = snabbdom.init([]);

const byId = id => document.getElementById(id);
const seq = (f, g) => x => g(f(x));
const apply = (x, f) => f(x);

const mapto = (x, e) => map(() => x, e);

const render = ({ counters, current }) =>
    h('div#container', [
        h('button#inc', '+'),
        h('button#dec', '-'),
        h('p', renderCounters(current, counters)),
        h('button#left', '<<'),
        h('button#right', '>>'),
        h('button#add-counter', 'Add counter'),
        h('button#remove-counter', 'Remove counter'),
    ]);

const renderCounters = (current, counters) =>
    counters.map((val, i) => h('span.counter' + (i === current ? '.current' : ''), `${val}`));

const data = localStorage.getItem('counters');
const initialState = data ? JSON.parse(data) : { counters: [0, 0], current: 0 };
let vnode = patch(byId('container'), render(initialState));

// Actions are represented as functions that update
// the appliction state.
// type Action :: s -> s
const switchCounter = x => ({ counters, current }) =>
    ({ counters, current: inbounds(counters.length, current + x) });
const inbounds = (bound, n) => n < 0 ? bound+n : n%bound;

const addCurrent = x => ({ counters, current }) =>
    ({ counters: update(counters[current]+x, current, counters), current });

const add = ({ counters, current }) =>
    ({ counters: counters.concat([0]), current });

const remove = ({ counters, current }) =>
    ({ counters: counters.slice(0, counters.length-1), current: Math.min(current, counters.length-2) });

const update = (newVal, at, a) => {
    const b = a.slice();
    b[at] = newVal;
    return b;
};

const updateStore = newState => {
    localStorage.setItem('counters', JSON.stringify(newState));
    return newState;
};

const updateView = p => vnode = patch(vnode, p);

const counters = build(function*() {
    const addCounter = mapto(add, yield fromDomEvent('click', byId('add-counter')));
    const removeCounter = mapto(remove, yield fromDomEvent('click', byId('remove-counter')));
    const nextCounter = mapto(switchCounter(-1), yield fromDomEvent('click', byId('left')));
    const prevCounter = mapto(switchCounter(1), yield fromDomEvent('click', byId('right')));
    const incCounter = mapto(addCurrent(1), yield fromDomEvent('click', byId('inc')));
    const decCounter = mapto(addCurrent(-1), yield fromDomEvent('click', byId('dec')));

    const actions = [addCounter, removeCounter, nextCounter, prevCounter, incCounter, decCounter].reduce(merge);

    const newState = rest(scan(apply, initialState, actions));
    return map(updateStore, newState);
});

runSource(seq(render, updateView), counters, Date.now);
