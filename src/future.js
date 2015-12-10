import TaskQueue from './TaskQueue';

const taskQueue = new TaskQueue(runActions);

// just :: a -> Future t a
export const just = x => at(0, x);

export const at = (t, x) => new Future(t, x);

export const newFuture = () => at(Infinity, void 0);

class Future {
    constructor(time, value) {
        this.time = time;
        this.value = value;
        this.action = void 0;
        this.length = 0;
    }

    map(f) {
        return map(f, this);
    }

    apply(f) {
        return apply(f, this);
    }

    concat(p) {
        return race(this, p);
    }

    setFuture(x) {
        setFuture(Date.now(), x, this);
    }
}

export const never = newFuture();

export function map(f, p) {
    return p.time < Infinity ? at(p.time, f(p.value))
        : mapFuture(f, p, newFuture());
}

function mapFuture(f, p, future) {
    when(new Map(f, future), p);
    return future;
}

class Map {
    constructor(f, promise) {
        this.f = f;
        this.promise = promise;
    }

    run(p) {
        const f = this.f;
        setFuture(p.time, f(p.value), this.promise);
    }
}

export function apply(f, p) {
    return p.time < Infinity ? f(p.value)
        : applyFuture(f, p, newFuture());
}

function applyFuture(f, p, future) {
    when(new Apply(f, future), p);
    return future;
}

class Apply {
    constructor(f, promise) {
        this.f = f;
        this.promise = promise;
    }

    run(p) {
        const f = this.f;
        when(new SetValue(this.promise), f(p));
    }
}

export const race = (a, b) => runRace(a.time, a, b.time, b);

const runRace = (at, a, bt, b) =>
    at === Infinity && bt === Infinity ? raceFuture(a, b, newFuture())
        : at <= bt ? a : b; // Prefer a when simultaneous

function raceFuture(a, b, f) {
    const s = new SetValue(f);
    when(s, a);
    when(s, b);
    return f;
}

class SetValue {
    constructor(p) {
        this.p = p;
    }

    run(p) {
        setFuture(p.time, p.value, this.p);
    }
}

function when(action, f) {
    if(f.time < Infinity) {
        action.run(f);
    } if (f.action === undefined) {
        f.action = action;
    } else {
        f[f.length++] = action;
    }
}

function runActions(f) {
    f.action.run(f);
    f.action = undefined;

    for (let i = 0; i < f.length; ++i) {
        f[i].run(f);
        f[i] = undefined;
    }
}

function setFuture(t, x, f) {
    if(f.time < Infinity) {
        return;
    }

    f.time = t;
    f.value = x;

    if(f.action === undefined) {
        return;
    }

    taskQueue.add(f);
}
