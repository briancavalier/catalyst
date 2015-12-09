import { hasEvent } from './event';

const id = x => x;
const k = x => _ => x;

// type Signal t a :: t -> (a, Signal t a)

const makeSignal = (value, next) => ({ value, next });

// newSignal :: (t -> a) -> t -> Signal t a
const newSignal = f => t => makeSignal(f(t), newSignal(f));

export const time = newSignal(id);

export const constant = x => newSignal(k(x));

export const map = (f, s) => t => {
    const { value, next } = s(t);
    return makeSignal(f(value), map(f, next));
};

export const liftA2 = (f, s1, s2) => t => {
    const { value: v1, next: n1 } = s1(t);
    const { value: v2, next: n2 } = s2(t);
    return makeSignal(f(v1, v2), liftA2(f, n1, n2));
};

export const step = (initial, e) => t => {
    if(hasEvent(t, e)) {
        const { value, next } = e.value;
        return makeSignal(value, step(value, next()));
    }
    return makeSignal(initial, step(initial, e));
};

