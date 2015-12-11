import { at, race, newFuture, never as neverF } from './future';

// type Event t a = Future t (a, Event t a)

// never :: Event t a
export const never = t => neverF;

// trim :: t -> Event t a -> Event t a
// drop past events
export const trim = e =>
    t => e(t).apply(f => f.time < t ? f.value.next(t) : f);

// runEvent :: (a -> ...) -> Event t a -> Clock t -> Future ()
export const runEvent = (f, e, t) =>
    doRunEvent(f, e(t), t, undefined);

const doRunEvent = (f, e, clock, _) =>
    e.map(({ value, next }) => doRunEvent(f, next(clock), clock, f(value)));

// map :: (a -> b) -> Event t a -> Event t b
export const map = (f, e) =>
    t => e(t).map(({ value, next }) => makeEvent(f(value), map(f, next)));

// filter :: (a -> boolean) -> Event t a -> Event t a
export const filter = (f, e) => t => filterNext(f, e(t), t);

const filterNext = (f, ev, t) =>
    ev.apply(({ time, value }) => f(value.value)
        ? filterKeep(f, time, value)
        : filterNext(f, value.next(t)));

const filterKeep = (f, t, { value, next }) =>
    at(t, makeEvent(value, filter(f, next)));

// merge :: Event t a -> Event t a -> Event t a
export const merge = (e1, e2) => t => mergeE(e1(t), e2(t), t);

const mergeE = (e1, e2, t) =>
    mergeNext(mapwl(e1, e2), mapwl(e2, e1), t);

const mapwl = (a, b) => a.map(x => ({winner:x, loser:b}));

const mergeNext = (a, b, t) => race(a, b).map(({ winner, loser }) =>
    makeEvent(winner.value, merge(t => loser, winner.next)));

// sample :: Signal t a -> Event t b -> Event t a
export const sample = (s, e) =>
    t => e(t).apply(({ time, value }) => sampleNext(time, s(time), value));

const sampleNext = (t, s, { next }) =>
    at(t, makeEvent(s.value, sample(s.next, next)));

// type Occur a :: a -> Occur a
// newInput :: () -> { occur :: Occur a, event :: Event t a }
export const newInput = () => nextEvent(newFuture());

const nextEvent = future =>
    ({ occur: newOccur(future), event: t => future });

const newOccur = future => value => {
    const { occur, event } = nextEvent(newFuture());
    future.setFuture(makeEvent(value, event));
    return occur;
};

// makeEvent :: a -> (() -> Event t a) -> Event t a
const makeEvent = (value, next) => ({ value, next });
