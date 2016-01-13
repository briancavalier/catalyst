import 'babel-polyfill'; // needed for generators
import { build, runEvent } from '../../src/source';
import { domEvent } from '../../src/dom';
import { map, merge, accum } from '../../src/event';
import snabbdom from 'snabbdom';
import h from 'snabbdom/h';

// -------------------------------------------------------
// Helpers
const byId = id => document.getElementById(id);
const click = id => domEvent('click', byId(id));

const seq = (f, g) => x => g(f(x));

const mapto = (x, e) => map(() => x, e);

// -------------------------------------------------------
// Rendering
const patch = snabbdom.init([]);

const render = ({ counters, current }) =>
    h('div#container', [
        h('button#add-counter', 'Add counter'),
        h('button#remove-counter', 'Remove counter'),
        h('p', renderCounters(current, counters)),
        h('button#left', '<<'),
        h('button#inc', '+'),
        h('button#dec', '-'),
        h('button#right', '>>')
    ]);

const renderCounters = (current, counters) =>
    counters.map((val, i) => h('span.counter' + (i === current ? '.current' : ''), `${val}`));

// -------------------------------------------------------
// App state
const data = localStorage.getItem('counters');
const initialState = data ? JSON.parse(data) : { counters: [0, 0], current: 0 };

// -------------------------------------------------------
// Actions are represented as functions that update
// the appliction state.
// type Action s :: s -> s
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

// -------------------------------------------------------
// Render initial state
let vnode = patch(byId('container'), render(initialState));
const updateView = newVTree => vnode = patch(vnode, newVTree);

// -------------------------------------------------------
// Build event network
const counters = build(function*() {
    const addCounter    = mapto(add, yield click('add-counter'));
    const removeCounter = mapto(remove, yield click('remove-counter'));
    const nextCounter   = mapto(switchCounter(-1), yield click('left'));
    const prevCounter   = mapto(switchCounter(1), yield click('right'));
    const incCounter    = mapto(addCurrent(1), yield click('inc'));
    const decCounter    = mapto(addCurrent(-1), yield click('dec'));

    const actions = [addCounter, removeCounter, nextCounter, prevCounter, incCounter, decCounter].reduce(merge);

    return accum(initialState, actions);
});

// -------------------------------------------------------
// Run event network
runEvent(seq(updateStore, render, updateView), counters, Date.now);
