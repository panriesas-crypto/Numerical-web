/** Simpson's 1/3 rule (requires even n). */
function simpson(expr, a, b, n) {
    const f = compileFunc(expr);
    if (n % 2 !== 0) n += 1; // make even
    const h = (b - a) / n;
    let s1 = 0, s2 = 0;
    for (let i = 1; i < n; i += 2) {
        const scope = { x: a + i * h }; attachAngleFunctions(scope);
        s1 += f.evaluate(scope);
    }
    for (let i = 2; i < n; i += 2) {
        const scope = { x: a + i * h }; attachAngleFunctions(scope);
        s2 += f.evaluate(scope);
    }
    const scopeA = { x: a }; attachAngleFunctions(scopeA);
    const scopeB = { x: b }; attachAngleFunctions(scopeB);
    return (h / 3) * (f.evaluate(scopeA) + 4 * s1 + 2 * s2 + f.evaluate(scopeB));
}

/** Trapezoidal rule. */
function trapezoidal(expr, a, b, n) {
    const f = compileFunc(expr);
    n = Math.max(1, Math.floor(n));
    const h = (b - a) / n;
    let sum = 0;
    for (let i = 1; i < n; i++) {
        const scope = { x: a + i * h }; attachAngleFunctions(scope);
        sum += f.evaluate(scope);
    }
    const scopeA = { x: a }; attachAngleFunctions(scopeA);
    const scopeB = { x: b }; attachAngleFunctions(scopeB);
    return (h / 2) * (f.evaluate(scopeA) + 2 * sum + f.evaluate(scopeB));
}