import { newInput, merge, runEvent } from './event';
import stepDo from './stepDo';

class Source {
    constructor(runSource) {
        this.runSource = runSource;
    }

    chain(f) {
        return new Source(clock => chain(f, clock, this.runSource(clock)));
    }
}

export function build(generator, ...args) {
    return stepDo(just, generator.apply(this, args), void 0);
}

export const newSource = f => new Source(newPushAdapter(f));

export const just = event => new Source(_ => ({ dispose: noop, event }));

export const runSource = (f, source, clock) => {
    const { dispose, event } = source.runSource(clock);
    runEvent(f, event, clock());
    return dispose;
};

const newPushAdapter = f => clock => {
    const { occur, event } = newInput(clock);
    const dispose = f(adapt(occur));
    return { dispose, event };
};

const chain = (f, clock, r1) =>
    combineChain(r1, f(r1.event).runSource(clock));

const combineChain = (r1, r2) => ({
        dispose: disposeBoth(r2, r1),
        event: r2.event
    });

const disposeBoth = (r1, r2) => () => {
    r1.dispose();
    r2.dispose();
};

const noop = () => {};

const adapt = occur => e => occur = occur(e);
