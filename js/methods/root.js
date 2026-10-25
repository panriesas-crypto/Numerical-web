/* ---------- Root finding ---------- */
function rootBisection(expr, a, b, tol, maxIter = 100) {
    const f = compileFunc(expr);
    const sA = { x: a }; attachAngleFunctions(sA);
    const sB = { x: b }; attachAngleFunctions(sB);
    let fa = f.evaluate(sA), fb = f.evaluate(sB);
    if (fa * fb > 0) throw new Error('f(a) and f(b) must have opposite signs (root not bracketed).');
    for (let i = 0; i < maxIter; i++) {
        const c = (a + b) / 2;
        const sc = { x: c }; attachAngleFunctions(sc);
        const fc = f.evaluate(sc);
        if (Math.abs(fc) < tol || (b - a) / 2 < tol) return c;
        if (fa * fc < 0) { b = c; fb = fc; } else { a = c; fa = fc; }
    }
    return (a + b) / 2;
}

function rootNewton(expr, x0, tol, maxIter = 100) {
    const f = compileFunc(expr);
    const h = 1e-6;
    let x = x0;
    for (let i = 0; i < maxIter; i++) {
        const s = { x }; attachAngleFunctions(s);
        const fx = f.evaluate(s);
        if (typeof fx !== 'number') throw new Error('Non-numeric evaluation.');
        const s2 = { x: x + h }; attachAngleFunctions(s2);
        const s3 = { x: x - h }; attachAngleFunctions(s3);
        const dfx = (f.evaluate(s2) - f.evaluate(s3)) / (2 * h);
        if (Math.abs(dfx) < 1e-14) throw new Error('Derivative too small (Newton stalled).');
        const x1 = x - fx / dfx;
        if (Math.abs(x1 - x) < tol) return x1;
        x = x1;
    }
    return x;
}

function rootSecant(expr, a, b, tol, maxIter = 100) {
    const f = compileFunc(expr);
    let x0 = a, x1 = b;
    for (let i = 0; i < maxIter; i++) {
        const s0 = { x: x0 }; attachAngleFunctions(s0);
        const s1 = { x: x1 }; attachAngleFunctions(s1);
        const f0 = f.evaluate(s0), f1 = f.evaluate(s1);
        if (Math.abs(f1) < tol) return x1;
        if (Math.abs(f1 - f0) < 1e-14) throw new Error('Secant: denominator too small.');
        const x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
        if (Math.abs(x2 - x1) < tol) return x2;
        x0 = x1; x1 = x2;
    }
    return x1;
}