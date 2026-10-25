/** Numerical derivative using central difference. */
function numericalDerivative(expr, x) {
    const f = compileFunc(expr);
    const h = 1e-5;
    const scope = { x: x + h }; attachAngleFunctions(scope);
    const fh = f.evaluate(scope);
    const scope2 = { x: x - h }; attachAngleFunctions(scope2);
    const fl = f.evaluate(scope2);
    if (typeof fh !== 'number' || typeof fl !== 'number') throw new Error('Cannot differentiate (non-numeric).');
    return (fh - fl) / (2 * h);
}