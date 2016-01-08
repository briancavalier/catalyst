// at :: t -> a -> Future t a
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

    setFuture(t, x) {
        setFuture(t, x, this);
    }
}

class Never extends Future {
    constructor() {
        super(Infinity, void 0);
    }

    map(f) {
        return this;
    }

    apply(f) {
        return this;
    }

    setFuture(t, x) {}
}

export const never = new Never();

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
    return p.time < Infinity ? f(p)
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

export const any = (f, a, b) =>
    a.time === Infinity && b.time === Infinity
        ? anyFuture(f, a, b, newFuture()) : f(a, b);

const anyFuture = (f, a, b, p) => {
    const any = new Any(f, a, b, p);
    when(any, a);
    when(any, b);
    return p;
};

class Any {
    constructor(f, a, b, p) {
        this.f = f;
        this.a = a;
        this.b = b;
        this.p = p;
    }

    run(p) {
        const f = this.f;
        setFuture(p.time, f(this.a, this.b), this.p);
    }
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

    runActions(f);
}
