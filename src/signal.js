import { map as mapE, accum as accumE, rest } from './event';

// Conceptually:
// type Signal t a = t -> (a, Signal t a)

// A time-varying value
class Signal {
    constructor(runSignal) {
        this._runSignal = runSignal;
        this._value = void 0;
    }

    runSignal(t) {
        return this._value === void 0
            ? this._value = this._runSignal(t) : this._value;
    }

    map(f) {
        return new Signal(t => mapSignal(f, this.runSignal(t)));
    }

    ap(xs) {
        return this.liftA2(apply, xs);
    }

    liftA2(f, b) {
        return new Signal(t => liftA2Signal(f, this.runSignal(t), b.runSignal(t)));
    }
}

// Internal signal helpers
const mapSignal = (f, { value, next }) => makePair(f(value), next.map(f));

const liftA2Signal = (f, { value: v1, next: n1 }, { value: v2, next: n2 }) =>
    makePair(f(v1, v2), liftA2(f, n1, n2));

const apply = (f, x) => f(x);

// A Signal whose value doesn't vary
class ConstSignal {
    constructor(x) {
        this.value = x;
        this.next = this;
    }

    runSignal(t) {
        return this;
    }

    map(f) {
        return new Signal(t => mapSignal(f, this));
    }

    ap(xs) {
        return xs.map(this.value);
    }

    liftA2(f, b) {
        return b.map(b => f(this.value, b));
    }
}

// newSignal :: (t -> a) -> Signal t a
export const newSignal = f => new Signal(f);

// constant :: a -> Signal t a
export const constant = x => new ConstSignal(x);

// map :: (a -> b) -> Signal t a -> Signal t b
export const map = (f, s) => s.map(f);

// liftA2 :: (a -> b -> c) -> Signal t a -> Signal t b -> Signal t c
export const liftA2 = (f, s1, s2) => s1.liftA2(f, s2);

// accum :: a -> Event t (a -> a) -> Signal t a
export const accum = (a, e) => step(a, rest(accumE(a, e)));

// step :: a -> Event t a -> Signal t a
export const step = (x, e) => switcher(constant(x), mapE(constant, e));

// switcher :: Signal t a -> Event t (Signal t a) -> Signal t a
export const switcher = (inits, e) =>
    new Signal(t => stepET(inits, e.runEvent(t), t));

const stepET = (s, ev, t) =>
    ev.time <= t ? switchTo(ev.value, t) : stayAt(s.runSignal(t), ev);

const stepE = (s, ev) => new Signal(t => stepET(s, ev, t));

const stayAt = (sv, ev) => makePair(sv.value, stepE(sv.next, ev));

const switchTo = ({ value, next }, t) => switchToS(value.runSignal(t), next);

const switchToS = ({ value, next }, e) => makePair(value, switcher(next, e));

// integrate :: (a -> a -> a) -> (dt -> a -> a) -> a -> Signal t a -> Signal t a
// TODO: This should move somewhere else
export const integrate = (integral, a, s) => runInteg(integral, a, s, 0);

const runInteg = (integral, a, s, t0) =>
    new Signal(t => stepInteg(integral, a, s.runSignal(t), t, t0));

const stepInteg = (integral, a, sv, t, t0) => {
    const b = integral(a, sv.value, t - t0);
    return makePair(b, runInteg(integral, b, sv.next, t));
};

// Simple pair helper
const makePair = (value, next) => ({ value, next });

