/*global process,MutationObserver,WebKitMutationObserver */
const isNode = typeof process !== 'undefined' &&
    Object.prototype.toString.call(process) === '[object process]';

const MutationObs = (typeof MutationObserver === 'function' && MutationObserver) ||
    (typeof WebKitMutationObserver === 'function' && WebKitMutationObserver);

class TaskQueue {
    constructor() {
        this.tasks = new Array(2 << 15);
        this.length = 0;
        this.drain = makeAsync(() => this._drain());
    }

    add(task) {
        if (this.length === 0) {
            this.drain();
        }

        this.tasks[this.length++] = task;
    }

    _drain() {
        let q = this.tasks;
        for (let i = 0; i < this.length; ++i) {
            q[i].run();
            q[i] = undefined;
        }
        this.length = 0;
    }
}

const taskQueue = new TaskQueue();

function makeAsync(f) {
    //jscs:disable validateIndentation
    return isNode ? createNodeScheduler(f)
        : MutationObs ? createBrowserScheduler(f)
        : createFallbackScheduler(f);
}

function createFallbackScheduler(f) {
    return () => setTimeout(f, 0);
}

function createNodeScheduler(f) {
    return () => process.nextTick(f);
}

function createBrowserScheduler(f) {
    let node = document.createTextNode('');
    (new MutationObs(f)).observe(node, { characterData: true });

    let i = 0;
    return () => node.data = (i ^= 1);
}

// just :: a -> Future t a
export const just = x => at(0, x);

export const at = (t, x) => new Future(t, x);

export const newFuture = () => {
    const future = makeFuture();
    return { setFuture: x => setFuture(Date.now(), x, future), future };
};

const makeFuture = () => at(Infinity, void 0);

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

    run() {
        runActions(this);
    }
}

export const never = makeFuture();

export function map(f, p) {
    return p.time < Infinity ? at(p.time, f(p.value))
        : mapFuture(f, p, makeFuture());
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
        : applyFuture(f, p, makeFuture());
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
    at === Infinity && bt === Infinity ? raceFuture(a, b, makeFuture())
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

const when = (action, f) => {
    if(f.time < Infinity) {
        action.run(f);
    } if (f.action === undefined) {
        f.action = action;
    } else {
        f[f.length++] = action;
    }
};

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
