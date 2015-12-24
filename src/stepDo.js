export default stepDo;

function stepDo(just, x, iterator) {
    try {
        return handleContinuation(just, iterator.next(x), iterator);
    } catch(e) {
        return error(just, e, iterator);
    }
}

const error = (just, e, iterator) =>
    handleContinuation(just, iterator.throw(e), iterator);

const handleContinuation = (just, result, iterator) => {
    const a = result.value;
    return result.done ? just(a) : a.chain(x => stepDo(just, x, iterator));
};
