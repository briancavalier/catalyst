import { map as mapE } from './event';

//const id = x => x;

// type Signal t a :: t -> (a, Signal t a)

//const cacheSignal = (s, value) =>
//    t => value === undefined ? (value = s(t)) : value;
//
//// newSignal :: (t -> a) -> t -> Signal t a
//const newSignal = f => cacheSignal(t => makePair(f(t), newSignal(f)));
//
//// time :: Signal t t
//export const time = newSignal(id);
//
//// constant :: a -> Signal t a
//export const constant = value => {
//    const next = t => ({ value, next });
//    return next;
//};
//
//// map :: (a -> b) -> Signal t a -> Signal t b
//export const map = (f, s) => cacheSignal(t => mapNext(f, s(t)));
//
//const mapNext = (f, { value, next }) => makePair(f(value), map(f, next));
//
//// liftA2 :: (a -> b -> c) -> Signal t a -> Signal t b -> Signal t c
//export const liftA2 = (f, s1, s2) =>
//    cacheSignal(t => liftA2Next(f, s1(t), s2(t)));
//
//const liftA2Next = (f, { value: v1, next: n1 }, { value: v2, next: n2 }) =>
//    makePair(f(v1, v2), liftA2(f, n1, n2));
//
//// step :: a -> Event t a -> Signal t a
//export const step = (x, e) =>
//    switcher(constant(x), mapE(constant, e));
//
//// switcher :: Signal t a -> Event t (Signal t a) -> Signal t a
//export const switcher = (inits, e) =>
//    cacheSignal(t => stepET(inits, e(t), t));
//
//const stepET = (s, ev, t) =>
//    ev.time <= t ? switchTo(ev.value, t) : stayAt(s(t), ev);
//
//const stepE = (s, ev) => cacheSignal(t => stepET(s, ev, t));
//
//const stayAt = (sv, ev) => makePair(sv.value, stepE(sv.next, ev));
//
//const switchTo = ({ value, next }, t) => switchToS(value(t), next);
//
//const switchToS = ({ value, next }, e) => makePair(value, switcher(next, e));
//
//
//const makePair = (value, next) => ({ value, next });

class Signal {
    constructor(runSignal) {
        this._runSignal = runSignal;
        this._value = void 0;
    }

    runSignal(t) {
        return this._value === void 0
            ? this._value = this._runSignal(t)
            : this._value;
    }

    map(f) {
        return new Signal(t => {
            const { value, next } = this.runSignal(t);
            return { value: f(value), next: next.map(f) };
        });
    }

    ap(xs) {
        return this.liftA2(apply, xs);
    }

    liftA2(f, b) {
        return new Signal(t => {
            const { value: v1, next: n1 } = this.runSignal(t);
            const { value: v2, next: n2 } = b.runSignal(t);
            return { value: f(v1, v2), next: n1.liftA2(f, n2) }
        });
    }
}

class ConstSignal {
    constructor(x) {
        this.value = x;
        this.next = this;
    }

    runSignal(t) {
        return this;
    }

    map(f) {
        return new Signal(t => makePair(f(this.value), this.map(f)));
    }

    ap(xs) {
        return xs.map(this.value);
    }

    liftA2(f, b) {
        return b.map(b => f(this.value, b));
    }
}

const apply = (f, x) => f(x);

export const constant = x => new ConstSignal(x);

export const map = (f, s) => s.map(f);

// liftA2 :: (a -> b -> c) -> Signal t a -> Signal t b -> Signal t c
export const liftA2 = (f, s1, s2) => s1.liftA2(f, s2);

// step :: a -> Event t a -> Signal t a
export const step = (x, e) =>
    switcher(constant(x), mapE(constant, e));

// switcher :: Signal t a -> Event t (Signal t a) -> Signal t a
export const switcher = (inits, e) =>
    new Signal(t => stepET(inits, e.runEvent(t), t));

const stepET = (s, ev, t) =>
    ev.time <= t ? switchTo(ev.value, t) : stayAt(s.runSignal(t), ev);

const stepE = (s, ev) => new Signal(t => stepET(s, ev, t));

const stayAt = (sv, ev) => makePair(sv.value, stepE(sv.next, ev));

const switchTo = ({ value, next }, t) => switchToS(value.runSignal(t), next);

const switchToS = ({ value, next }, e) => makePair(value, switcher(next, e));


const makePair = (value, next) => ({ value, next });
