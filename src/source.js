import { newInput, merge, runEvent } from './event';
import stepDo from './stepDo';

class Source {
    constructor(runSource) {
        this._runSource = runSource;
    }

    runSource(clock) {
        return this._runSource(newInput(clock));
    }

    chain(f) {
        return new Source(input => chain(f, input, this._runSource(input)));
    }
}

export function build(generator, ...args) {
    return stepDo(just, void 0, generator.apply(this, args));
}

export const newSource = f => new Source(newPushAdapter(f));

export const just = event => new Source(_ => ({ dispose: noop, event }));

export const runSource = (f, source, clock) => {
    const { dispose, event } = source.runSource(clock);
    runEvent(f, event, clock());
    return dispose;
};

const newPushAdapter = f => newInput => {
    const { occur, event } = newInput();
    const dispose = f(adapt(occur));
    return { dispose, event };
};

const chain = (f, input, r1) =>
    combineChain(r1, f(r1.event)._runSource(input));

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
