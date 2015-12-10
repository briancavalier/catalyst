import { at, race, newFuture, never } from './future';

// type Event t a = Future t (a, Event t a)

// isPast :: Event t a -> boolean
export const isPast = (now, e) => getTime(e) < now;

export const hasEvent = (now, e) => getTime(e) <= now;

// getTime :: Event t a -> t
const getTime = e => e.time;

// empty :: Event t a
export const empty = never;

// makeEvent :: a -> (() -> Event t a) -> Event t a
const makeEvent = (value, next) => ({ value, next });

// trim :: t -> Event t a -> Event t a
// drop past events
export const trim = (t, e) => isPast(t, e) ? trim(e.next()): e;

// runEvent :: (a -> ...) -> Event t a -> Promise ()
export const runEvent = (f, e) => e.map(({ value, next }) => {
    f(value);
    return runEvent(f, next());
});

// map :: (a -> b) -> Event t a -> Event t b
export const map = (f, e) =>
    e.map(({ value, next }) => makeEvent(f(value), _ => map(f, next())));

// filter :: (a -> boolean) -> Event t a -> Event t a
export const filter = (f, e) =>
    e.apply(({ time, value }) => f(value.value)
        ? keepNext(f, time, value)
        : filter(f, value.next()));

const keepNext = (f, t, { value, next }) =>
    at(t, makeEvent(value, _ => filter(f, next())));

// merge :: Event t a -> Event t a -> Event t a
export const merge = (e1, e2) => mergeNext(mapwl(e1, e2), mapwl(e2, e1));

const mapwl = (a, b) => a.map(x => ({winner:x, loser:b}));

const mergeNext = (a, b) => race(a, b).map(({ winner, loser }) =>
    makeEvent(winner.value, _ => merge(loser, winner.next())));

// sample :: Signal t a -> Event t b -> Event t a
export const sample = (s, e) =>
    e.apply(({ time, value }) => sampleNext(time, s(time), value));

const sampleNext = (t, s, { next }) =>
    at(t, makeEvent(s.value, _ => sample(s.next, next())));

export const newInput = () => nextEvent(newFuture());

const nextEvent = ({ setFuture, future: event }) =>
    ({ occur: newOccur(setFuture), event });

const newOccur = setFuture => value => {
    const { occur, event } = nextEvent(newFuture());
    setFuture(makeEvent(value, _ => event));
    return occur;
};
