import { at, any, newFuture, never as neverF } from './future';

// Conceptually:
// type Event t a = Future t (a, Event t a)

class Event {
    constructor(runEvent) {
        this._runEvent = runEvent;
        this._value = void 0;
    }

    runEvent(t) {
        return this._value === void 0
            ? this._value = this._runEvent(t) : this._value;
    }
}

class FutureEvent {
    constructor(future) {
        this._value = future;
    }

    runEvent(t) {
        return this._value;
    }
}

// never :: Event t a
export const never = new FutureEvent(neverF);

// runEvent :: (a -> ()) -> Event t a -> t -> Future t ()
export const runEvent = (f, e, t) =>
    e.runEvent(t).apply(({ time, value }) =>
        runEvent(f, value.next, time, f(value.value)));

// trim :: t -> Event t a -> Event t a
// drop past events
export const trim = e => new Event(t => trimNext(e.runEvent(t), t));
const trimNext = (f, t) => f.time < t ? trim(f.value.next).runEvent(t) : f;

// map :: (a -> b) -> Event t a -> Event t b
export const map = (f, e) =>
    new Event(t => e.runEvent(t).map(({ value, next }) =>
        eventStep(f(value), map(f, next))));

// filter :: (a -> boolean) -> Event t a -> Event t a
export const filter = (f, e) =>
    new Event(t => filterNext(f, e.runEvent(t), t));

const filterNext = (f, ev, t) =>
    ev.apply(({ time, value }) => f(value.value)
        ? filterKeep(f, time, value)
        : filterNext(f, value.next.runEvent(t)));

const filterKeep = (f, t, { value, next }) =>
    at(t, eventStep(value, filter(f, next)));

// rest :: Event t a -> Event t a
// Drop first occurrence
export const rest = e =>
    new Event(t => e.runEvent(t).apply(({ time, value }) =>
        value.next.runEvent(time)));

// merge :: Event t a - Event t a -> Event t a
// Merge two events. Pick occurrence from e1 when e1 and e2
// occur simultaneously
export const merge = (e1, e2) => mergeWith(fst, e1, e2);

// mergeWith :: (a -> a -> a) -> Event t a -> Event t a -> Event t a
// Merge two events. Use f to combine simultaneous occurrences
export const mergeWith = (f, e1, e2) =>
    new Event(t => mergeE(f, e1.runEvent(t), e2.runEvent(t)));

const mergeE = (f, e1, e2) =>
    any((a, b) => mergeSelect(f, a, b), e1, e2);

const mergeSelect = (f, a, b) =>
    a.time < b.time ? mergeNext(f, a, b)
        : b.time < a.time ? mergeNext(f, b, a)
        : mergeSimultaneous(f, a.time, a.value, b.value);

const mergeSimultaneous = (f, time, ev1, ev2) =>
    eventStep(f(ev1.value, ev2.value), mergeWith(f, ev1.next, ev2.next));

const mergeNext = (f, { time, value }, loser) =>
    eventStep(value.value, mergeWith(f, new FutureEvent(loser), value.next));

// scan :: (a -> b -> a) -> a -> Event t b -> Event t a
export const scan = (f, a, e) =>
    new Event(t => at(t, eventStep(a, runAccum(f, a, e))));

// accum :: a -> Event t (a -> a) -> Event t a
export const accum = (a, e) => scan((a, f) => f(a), a, e);

const runAccum = (f, a, e) =>
    new Event(t => e.runEvent(t).map(({ value, next }) =>
        accumNext(f, f(a, value), next)));

const accumNext = (f, b, next) => eventStep(b, runAccum(f, b, next));

// sampleWith :: (a -> b -> c) -> Signal t a -> Event t b -> Event t c
export const sampleWith = (f, s, e) =>
    new Event(t => e.runEvent(t).apply(({ time, value }) => sampleWithNext(f, time, s.runSignal(time), value)));

const sampleWithNext = (f, t, s, e) =>
    at(t, eventStep(f(s.value, e.value), sampleWith(f, s.next, e.next)));

// sample :: Signal t a -> Event t b -> Event t a
export const sample = (s, e) => sampleWith(fst, s, e);

// type Occur a :: a -> Occur a
// newInput :: Clock t -> { occur :: Occur a, event :: Event t a }
export const newInput = clock => nextEvent(clock, newFuture());

const nextEvent = (clock, future) =>
    ({ occur: newOccur(clock, future), event: new FutureEvent(future) });

const newOccur = (clock, future) => value => {
    const { occur, event } = nextEvent(clock, newFuture());
    future.setFuture(clock(), eventStep(value, event));
    return occur;
};

// eventStep :: a -> Event t a -> (a, Event t a)
export const eventStep = (value, next) => ({ value, next });

// fst :: a -> a -> a
const fst = (a, _) => a;
