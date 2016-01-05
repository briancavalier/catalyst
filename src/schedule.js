import { newSource } from './source';

export default (cancel, schedule) => newSource(occur => {
    let next;
    const onNext = x => {
        occur(x);
        next = schedule(onNext);
    };
    next = schedule(onNext);

    return () => cancel(next);
});
