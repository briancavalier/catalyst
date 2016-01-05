export const newClock = now => {
    const start = now();
    return () => now() - start;
};
