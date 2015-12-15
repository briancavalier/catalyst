import { constant, map } from './signal';

const adapt = occur => e => occur = occur(e);

export const adapter = newInput => {
    let { occur, event } = newInput();
    return { occur: adapt(occur), event };
};

export const fromValue = input => map(getValue, constant(input));

export const fromDomEvent = (input, ev, node, capture = false) => {
    let { occur, event } = adapter(input);
    node.addEventListener(ev, occur, capture);
    return event;
};

const getValue = input => input.value;
