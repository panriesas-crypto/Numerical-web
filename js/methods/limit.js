/** Numeric limit (two-sided, then one-sided fallback). */
function numericLimit(expr, x0) {
    const f = compileFunc(expr);
    let prev = NaN;
    for (let k = 1; k <= 30; k++) {
        const dx = Math.pow(10, -k);
        const sr = { x: x0 + dx }; attachAngleFunctions(sr);
        const sl = { x: x0 - dx }; attachAngleFunctions(sl);
        const vr = f.evaluate(sr);
        const vl = f.evaluate(sl);
        if (typeof vr !== 'number' || typeof vl !== 'number' ||
            !Number.isFinite(vr) || !Number.isFinite(vl)) {
            // try one-sided at this resolution
        }
        const avg = (vr + vl) / 2;
        if (Number.isFinite(avg) && Math.abs(avg - prev) < 1e-6 && k > 3) return avg;
        prev = avg;
    }
    return prev;
}