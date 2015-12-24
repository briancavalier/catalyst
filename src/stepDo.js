const stepDo = (just, iterator, x) =>
    handleContinuation(just, iterator, iterator.next(x));

const handleContinuation = (just, iterator, result) =>
    result.done ? just(result.value)
        : result.value.chain(x => stepDo(just, iterator, x));

export default stepDo;
