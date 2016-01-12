import { newSignal, signalStep } from './signal';

// Euler integration
// integrate :: (a -> b -> dt -> a) -> a -> Signal t b -> Signal t a
export default (integral, a, s) =>
    newSignal(t => signalStep(a, runInteg(integral, a, s, t)));

const runInteg = (integral, a0, s, t0) =>
    newSignal(t => stepInteg(integral, a0, s.runSignal(t), t, t0));

const stepInteg = (integral, a0, sv, t, t0) => {
    const a = integral(a0, sv.value, t - t0);
    return signalStep(a, runInteg(integral, a, sv.next, t));
};
