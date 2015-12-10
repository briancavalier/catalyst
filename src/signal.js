const id = x => x;
const k = x => _ => x;

// type Signal t a :: t -> (a, Signal t a)

const makeSignal = (value, next) => ({ value, next });

// newSignal :: (t -> a) -> t -> Signal t a
const newSignal = f => t => makeSignal(f(t), newSignal(f));

// time :: Signal t t
export const time = newSignal(id);

// constant :: a -> Signal t a
export const constant = x => newSignal(k(x));

// map :: (a -> b) -> Signal t a -> Signal t b
export const map = (f, s) => t => {
    const { value, next } = s(t);
    return makeSignal(f(value), map(f, next));
};

// liftA2 :: (a -> b -> c) -> Signal t a -> Signal t b -> Signal t c
export const liftA2 = (f, s1, s2) => t => {
    const { value: v1, next: n1 } = s1(t);
    const { value: v2, next: n2 } = s2(t);
    return makeSignal(f(v1, v2), liftA2(f, n1, n2));
};

// step :: a -> Event t a -> Signal t a
export const step = (initial, e) => t => stepET(initial, e(t), t);

const stepE = (x, ev) => t => stepET(x, ev, t);

const stepET = (x, ev, t) => {
    if(ev.time <= t) {
        const { value, next } = ev.value;
        return makeSignal(value, step(value, next));
    }
    return makeSignal(x, stepE(x, ev));
};
