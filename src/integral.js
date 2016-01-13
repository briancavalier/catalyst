import { newSignal, signalStep } from './signal';

// Euler integration
// integral :: (a -> b -> dt -> a) -> a -> Signal t b -> Signal t a
export const integral = (f, a, s) =>
    newSignal(t => signalStep(a, runIntegral(f, a, s, t)));

const runIntegral = (f, a0, s, t0) =>
    newSignal(t => step(f, a0, s.runSignal(t), t, t0));

const step = (f, a0, sv, t, t0) => {
    const a = f(a0, sv.value, t - t0);
    return signalStep(a, runIntegral(f, a, sv.next, t));
};

// Euler integration with extra reference data w
// integralWith :: (w -> a -> b -> dt -> a) -> a -> Signal t w -> Signal t b -> Signal t a
export const integralWith = (f, w, a, s) =>
    newSignal(t => signalStep(a, runIntegralWith(f, w, a, s, t)));

const runIntegralWith = (f, w, a0, s, t0) =>
    newSignal(t => stepWith(f, w.runSignal(t), a0, s.runSignal(t), t, t0));

const stepWith = (f, w, a0, sv, t, t0) => {
    const a = f(w.value, a0, sv.value, t - t0);
    return signalStep(a, runIntegralWith(f, w.next, a, sv.next, t));
};
