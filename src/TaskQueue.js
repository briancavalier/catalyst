/*global process,MutationObserver,WebKitMutationObserver */
const isNode = typeof process !== 'undefined' &&
    Object.prototype.toString.call(process) === '[object process]';

const MutationObs = (typeof MutationObserver === 'function' && MutationObserver) ||
    (typeof WebKitMutationObserver === 'function' && WebKitMutationObserver);

export default class TaskQueue {
    constructor(runTask) {
        this.tasks = new Array(2 << 15);
        this.length = 0;
        this.drain = makeAsync(() => this._drain());
        this.runTask = runTask;
    }

    add(task) {
        if (this.length === 0) {
            this.drain();
        }

        this.tasks[this.length++] = task;
    }

    _drain() {
        const runTask = this.runTask;
        const q = this.tasks;
        for (let i = 0; i < this.length; ++i) {
            runTask(q[i]);
            q[i] = undefined;
        }
        this.length = 0;
    }
}

function makeAsync(f) {
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
