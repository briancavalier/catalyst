import { newSource } from './source';
import { constant, map } from './signal';

export const fromInput = input => map(getValue, constant(input));

const getValue = input => input.value;

export const fromDomEvent = (ev, node, capture = false) =>
    newSource(occur => addListener(ev, node, capture, occur));

const addListener = (ev, node, capture, occur) => {
    node.addEventListener(ev, occur, capture);
    return () => node.removeEventListener(ev, occur, capture);
};

