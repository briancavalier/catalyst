import { at, race, newFuture, never as neverF } from './future';

// type Event t a = Future t (a, Event t a)

class Event {
    constructor(runEvent) {
        this._runEvent = runEvent;
        this._value = void 0;
    }

    runEvent(t) {
        return this._value === void 0
            ? this._value = this._runEvent(t)
            : this._value;
    }
}

// never :: Event t a
export const never = new Event(t => neverF);

// trim :: t -> Event t a -> Event t a
// drop past events
export const trim = e => t => trimNext(e.runEvent(t), t);
const trimNext = (f, t) => f.time < t ? trim(f.value.next)(t) : f;

// runEvent :: (a -> ...) -> Event t a -> Clock t -> Future ()
export const runEvent = (f, e, t) =>
    doRunEvent(f, e.runEvent(t), undefined);

const doRunEvent = (f, ev, _) =>
    ev.map(({ value, next }) => doRunEvent(f, next.runEvent(ev.time), f(value)));

// map :: (a -> b) -> Event t a -> Event t b
export const map = (f, e) =>
    new Event(t => e.runEvent(t).map(({ value, next }) => makePair(f(value), map(f, next))));

// filter :: (a -> boolean) -> Event t a -> Event t a
export const filter = (f, e) =>
    new Event(t => filterNext(f, e.runEvent(t), t));

const filterNext = (f, ev, t) =>
    ev.apply(({ time, value }) => f(value.value)
        ? filterKeep(f, time, value)
        : filterNext(f, value.next.runEvent(t)));

const filterKeep = (f, t, { value, next }) =>
    at(t, makePair(value, filter(f, next)));

// merge :: Event t a -> Event t a -> Event t a
export const merge = (e1, e2) =>
    new Event(t => mergeE(e1.runEvent(t), e2.runEvent(t), t));

const mergeE = (e1, e2, t) =>
    mergeNext(mapwl(e1, e2), mapwl(e2, e1), t);

const mapwl = (a, b) => a.map(x => ({winner:x, loser:b}));

const mergeNext = (a, b, t) => race(a, b).map(({ winner, loser }) =>
    makePair(winner.value, merge(new Event(t => loser), winner.next)));

// sample :: Signal t a -> Event t b -> Event t a
export const sample = (s, e) =>
    new Event(t => e.runEvent(t).apply(({ time, value }) => sampleNext(time, s.runSignal(time), value)));

const sampleNext = (t, s, { next }) =>
    at(t, makePair(s.value, sample(s.next, next)));

// type Occur a :: a -> Occur a
// newInput :: () -> { occur :: Occur a, event :: Event t a }
export const newInput = clock => () => nextEvent(clock, newFuture());

const nextEvent = (clock, future) =>
    ({ occur: newOccur(clock, future), event: new Event(t => future) });

const newOccur = (clock, future) => value => {
    const { occur, event } = nextEvent(clock, newFuture());
    future.setFuture(clock(), makePair(value, event));
    return occur;
};

// makeEvent :: a -> (() -> Event t a) -> Event t a
const makePair = (value, next) => ({ value, next });
