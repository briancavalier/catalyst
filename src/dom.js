import { newInput } from './event';
import { constant, map } from './signal';

const adapt = occur => e => occur = occur(e);

export const adapter = () => {
    let { occur, event } = newInput();
    return { occur: adapt(occur), event };
};

export const fromValue = input => map(getValue, constant(input));

export const fromDomEvent = (ev, node, capture = false) => {
    let { occur, event } = adapter();
    node.addEventListener(ev, occur, capture);
    return event;
};

const getValue = input => input.value;
