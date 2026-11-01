import {
  evaluate,
  derivative,
  lusolve,
  inv,
  multiply,
  transpose,
  det,
} from "mathjs";
import {
  NumericalMethodContract,
  RootFindingMethod,
  LinearAlgebraMethod,
  InterpolationMethod,
  ExtrapolationMethod,
  IntegrationMethod,
  DifferentiationMethod,
} from "./NumericalMethod.js";

const f = (expr, x) => {
  const y = evaluate(expr, { x });
  if (typeof y !== "number" || !Number.isFinite(y))
    throw Error(`f(${x}) ไม่ใช่ค่าตัวเลข`);
  return y;
};
const finite = (v, n) => {
  if (!Number.isFinite(Number(v))) throw Error(`${n} ต้องเป็นตัวเลข`);
  return Number(v);
};
const result = (value, rows = [], extra = {}) => ({ value, rows, ...extra });
const positive = (v, name) => {
  const n = finite(v, name);
  if (n <= 0) throw Error(`${name} ต้องมากกว่า 0`);
  return n;
};
const uniqueXs = (xs) => {
  if (new Set(xs).size !== xs.length) throw Error("ค่า X ต้องไม่ซ้ำกัน");
};
const symmetric = (A) =>
  A.every((r, i) =>
    r.every(
      (v, j) =>
        Math.abs(v - A[j][i]) <=
        1e-10 * Math.max(1, Math.abs(v), Math.abs(A[j][i])),
    ),
  );

function rootRun(kind, p) {
  let { fx = "x^2-2", a = 1, b = 2, tol = 1e-6, maxIter = 100 } = p;
  a = finite(a, "a");
  b = finite(b, "b");
  tol = positive(tol, "tol");
  maxIter = positive(maxIter, "maxIter");

  if (!Number.isInteger(maxIter)) {
    throw Error("maxIter ต้องเป็นจำนวนเต็ม");
  }

  const rows = [];
  let x,
    converged = false;

  if (kind === "Bisection" || kind === "False Position") {
    if (a >= b) throw Error("ต้องกำหนด a < b");

    let fa = f(fx, a),
      fb = f(fx, b);

    if (Math.abs(fa) <= tol)
      return result(a, [{ iteration: 0, x: a, fx: fa, error: 0 }], {
        converged: true,
      });

    if (Math.abs(fb) <= tol)
      return result(b, [{ iteration: 0, x: b, fx: fb, error: 0 }], {
        converged: true,
      });

    if (fa * fb > 0) throw Error("f(a) และ f(b) ต้องมีเครื่องหมายต่างกัน");

    for (let i = 1; i <= maxIter; i++) {
      const denominator = fb - fa;

      if (kind === "False Position" && Math.abs(denominator) < 1e-15)
        throw Error("ตัวหาร False Position ใกล้ศูนย์");

      x = kind === "Bisection" ? (a + b) / 2 : (a * fb - b * fa) / denominator;

      const fxv = f(fx, x);
      const previousX = rows.length ? rows[rows.length - 1].x : null;

      const error = previousX === null ? null : Math.abs(x - previousX);

      const errorPercent =
        previousX === null
          ? null
          : x === 0
            ? null
            : (error / Math.abs(x)) * 100;

      rows.push({
        iteration: i,
        a,
        b,
        x,
        fx: fxv,
        error,
        errorPercent,
      });

      if (Math.abs(fxv) <= tol || (error !== null && error <= tol)) {
        converged = true;
        break;
      }

      if (fa * fxv < 0) {
        b = x;
        fb = fxv;
      } else {
        a = x;
        fa = fxv;
      }
    }
  } else if (kind === "Newton-Raphson") {
    x = finite(p.x0 ?? 1, "x0");

    for (let i = 1; i <= maxIter; i++) {
      const y = f(fx, x);
      const dy = Number(evaluate(derivative(fx, "x").toString(), { x }));

      if (!Number.isFinite(dy) || Math.abs(dy) < 1e-14)
        throw Error("อนุพันธ์เป็นศูนย์หรือไม่ใช่ตัวเลข");

      const nx = x - y / dy;
      const error = Math.abs(nx - x);

      if (!Number.isFinite(nx)) throw Error("Newton-Raphson คำนวณค่าไม่จำกัด");

      rows.push({ iteration: i, x, fx: y, derivative: dy, nextX: nx, error });
      x = nx;

      if (error <= tol || Math.abs(f(fx, x)) <= tol) {
        converged = true;
        break;
      }
    }
  } else if (kind === "Secant") {
    let x0 = finite(p.x0 ?? a, "x0");
    let x1 = finite(p.x1 ?? b, "x1");

    for (let i = 1; i <= maxIter; i++) {
      const y0 = f(fx, x0),
        y1 = f(fx, x1);

      if (Math.abs(y1 - y0) < 1e-14) throw Error("ตัวหาร Secant ใกล้ศูนย์");

      const nx = x1 - (y1 * (x1 - x0)) / (y1 - y0);
      const error = Math.abs(nx - x1);

      if (!Number.isFinite(nx)) throw Error("Secant คำนวณค่าไม่จำกัด");

      rows.push({ iteration: i, x0, x1, nextX: nx, fx: f(fx, nx), error });

      x0 = x1;
      x1 = nx;

      if (error <= tol || Math.abs(f(fx, nx)) <= tol) {
        converged = true;
        break;
      }
    }
    x = x1;
  } else if (kind === "One Point Iteration") {
    x = finite(p.x0 ?? 1, "x0");
    const gx = p.gx || "cos(x)";

    for (let i = 1; i <= maxIter; i++) {
      const nx = f(gx, x);
      const error = Math.abs(nx - x);

      rows.push({ iteration: i, x, nextX: nx, error });
      x = nx;

      if (error <= tol) {
        converged = true;
        break;
      }
    }
  } else {
    const lo = finite(p.a ?? -10, "a");
    const hi = finite(p.b ?? 10, "b");
    const N = 300;

    if (lo >= hi) throw Error("ต้องกำหนด a < b");

    let best = { x: lo, y: Math.abs(f(fx, lo)) };

    for (let i = 0; i <= N; i++) {
      const xx = lo + ((hi - lo) * i) / N;
      const yy = Math.abs(f(fx, xx));

      if (yy < best.y) best = { x: xx, y: yy };
    }

    return result(best.x, [{ x: best.x, fx: f(fx, best.x) }], {
      converged: best.y <= tol,
      description: "ค่าประมาณจากการค้นหาจุดที่ |f(x)| ต่ำที่สุด",
    });
  }

  if (!converged) throw Error(`${kind} ไม่ลู่เข้าภายใน ${maxIter} รอบ`);

  return result(x, rows, { converged });
}

function plain(v) {
  return v && typeof v.toArray === "function" ? v.toArray() : v;
}
function solveLinear(A, b) {
  if (
    !Array.isArray(A) ||
    !Array.isArray(b) ||
    A.length !== b.length ||
    A.some((r) => r.length !== b.length)
  )
    throw Error("A ต้องเป็นเมทริกซ์จัตุรัสและขนาดตรงกับ b");
  return Array.from(plain(lusolve(A, b))).map((r) =>
    Array.isArray(r) ? r[0] : r,
  );
}
function gaussianSolve(A, b, gaussJordan = false) {
  const M = A.map((r, i) => [...r, b[i]]),
    n = M.length;
  for (let k = 0; k < n; k++) {
    let pivot = k;
    for (let i = k + 1; i < n; i++)
      if (Math.abs(M[i][k]) > Math.abs(M[pivot][k])) pivot = i;
    if (Math.abs(M[pivot][k]) < 1e-14)
      throw Error("เมทริกซ์เอกฐาน ไม่สามารถหาคำตอบเฉพาะได้");
    [M[k], M[pivot]] = [M[pivot], M[k]];
    if (gaussJordan) {
      const d = M[k][k];
      for (let j = k; j <= n; j++) M[k][j] /= d;
      for (let i = 0; i < n; i++)
        if (i !== k) {
          const c = M[i][k];
          for (let j = k; j <= n; j++) M[i][j] -= c * M[k][j];
        }
    } else {
      for (let i = k + 1; i < n; i++) {
        const c = M[i][k] / M[k][k];
        for (let j = k; j <= n; j++) M[i][j] -= c * M[k][j];
      }
    }
  }
  if (gaussJordan) return M.map((r) => r[n]);
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}
function luSolve(A, b) {
  const n = A.length,
    L = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
    ),
    U = A.map((r) => r.slice());
  for (let k = 0; k < n; k++) {
    if (Math.abs(U[k][k]) < 1e-14)
      throw Error(
        "LU แบบนี้พบ pivot ศูนย์; ลอง Gauss Elimination หรือสลับสมการ",
      );
    for (let i = k + 1; i < n; i++) {
      const c = U[i][k] / U[k][k];
      L[i][k] = c;
      for (let j = k; j < n; j++) U[i][j] -= c * U[k][j];
    }
  }
  const y = Array(n).fill(0),
    x = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = b[i];
    for (let j = 0; j < i; j++) s -= L[i][j] * y[j];
    y[i] = s;
  }
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let j = i + 1; j < n; j++) s -= U[i][j] * x[j];
    x[i] = s / U[i][i];
  }
  return x;
}

function linearRun(kind, p) {
  const A = p.A ?? [
    [4, 1],
    [1, 3],
  ];

  const b = p.b ?? [1, 2];

  if (!Array.isArray(A) || A.length === 0) {
    throw Error("A ต้องเป็นเมทริกซ์ที่ไม่ว่าง");
  }

  const n = A.length;

  if (
    A.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== n ||
        row.some((v) => typeof v !== "number" || !Number.isFinite(v)),
    )
  ) {
    throw Error("A ต้องเป็นเมทริกซ์จัตุรัสที่มีตัวเลขจำกัด");
  }

  if (
    !Array.isArray(b) ||
    b.length !== n ||
    b.some((v) => typeof v !== "number" || !Number.isFinite(v))
  ) {
    throw Error("b ต้องเป็นเวกเตอร์ตัวเลขที่มีขนาดตรงกับ A");
  }

  let x;
  let rows = [];
  if (kind === "Cramer Rule") {
    const det = mathDet(A);
    if (Math.abs(det) < 1e-12) throw Error("det(A)=0 ไม่มีคำตอบเฉพาะ");
    x = b.map((v, j) => {
      let M = A.map((r, i) => r.map((z, k) => (k === j ? b[i] : z)));
      return mathDet(M) / det;
    });
  } else if (kind === "Matrix Inversion") {
    x = plain(multiply(inv(A), b));
  } else if (kind === "LU Decomposition") {
    x = luSolve(A, b);
  } else if (kind === "Cholesky Decomposition") {
    if (!symmetric(A)) throw Error("Cholesky ต้องใช้เมทริกซ์สมมาตร");
    const L = cholesky(A);
    x = solveLinear(plain(multiply(L, transpose(L))), b);
  } else if (kind === "Jacobi" || kind === "Gauss-Seidel") {
    x = Array(n).fill(0);
    const tol = positive(p.tol ?? 1e-8, "tol"),
      max = positive(p.maxIter ?? 100, "maxIter");
    if (!Number.isInteger(max)) {
      throw Error("maxIter ต้องเป็นจำนวนเต็ม");
    }
    let converged = false;
    for (let k = 1; k <= max; k++) {
      let old = x.slice(),
        next = x.slice();
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++)
          if (j !== i) s -= A[i][j] * (kind === "Jacobi" ? old[j] : next[j]);
        if (Math.abs(A[i][i]) < 1e-14) throw Error("สมาชิกแนวทแยงเป็นศูนย์");
        next[i] = s / A[i][i];
      }
      let error = Math.max(...next.map((v, i) => Math.abs(v - old[i])));
      x = next;
      rows.push({
        iteration: k,
        ...Object.fromEntries(x.map((v, i) => [`x${i + 1}`, v])),
        error,
      });
      const residual = Math.max(
        ...A.map((row, i) =>
          Math.abs(row.reduce((sum, value, j) => sum + value * x[j], 0) - b[i]),
        ),
      );

      if (!Number.isFinite(error) || !Number.isFinite(residual)) {
        throw Error(`${kind} มีค่าที่ไม่จำกัดระหว่างคำนวณ`);
      }

      if (error < tol && residual < tol) {
        converged = true;
        break;
      }
    }
    if (!converged) throw Error(`${kind} ไม่ลู่เข้าภายในจำนวนรอบที่กำหนด`);
  } else if (kind === "Conjugate Gradient") {
    if (!symmetric(A))
      throw Error("Conjugate Gradient ต้องใช้เมทริกซ์สมมาตร positive definite");
    cholesky(A);
    const tol = positive(p.tol ?? 1e-8, "tol"),
      max = positive(p.maxIter ?? n * 10, "maxIter");
    if (!Number.isInteger(max)) {
      throw Error("maxIter ต้องเป็นจำนวนเต็ม");
    }
    x = Array(n).fill(0);
    let r = b.slice(),
      d = r.slice(),
      rr = dot(r, r),
      converged = Math.sqrt(rr) < tol;
    for (let k = 1; k <= max && !converged; k++) {
      const Ad = matVec(A, d),
        den = dot(d, Ad);
      if (den <= 0 || !Number.isFinite(den))
        throw Error("Conjugate Gradient พบตัวหารผิดปกติ");
      const alpha = rr / den;
      x = x.map((v, i) => v + alpha * d[i]);
      const nr = r.map((v, i) => v - alpha * Ad[i]),
        rr2 = dot(nr, nr);
      rows.push({ iteration: k, residual: Math.sqrt(rr2) });
      if (Math.sqrt(rr2) < tol) {
        converged = true;
        break;
      }
      d = nr.map((v, i) => v + (rr2 / rr) * d[i]);
      r = nr;
      rr = rr2;
    }
    if (!converged)
      throw Error("Conjugate Gradient ไม่ลู่เข้าภายในจำนวนรอบที่กำหนด");
  } else if (kind === "Gauss Elimination") {
    x = gaussianSolve(A, b, false);
  } else if (kind === "Gauss Jordan") {
    x = gaussianSolve(A, b, true);
  } else {
    x = solveLinear(A, b);
  }
  return result(x, rows, {
    residual: Math.max(
      ...A.map((r, i) =>
        Math.abs(r.reduce((s, v, j) => s + v * x[j], 0) - b[i]),
      ),
    ),
  });
}
function mathDet(A) {
  return Number(det(A));
}
function dot(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}
function matVec(A, x) {
  return A.map((r) => dot(r, x));
}
function cholesky(A) {
  let n = A.length,
    L = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) {
        if (s <= 0) throw Error("เมทริกซ์ต้องเป็น positive definite");
        L[i][j] = Math.sqrt(s);
      } else L[i][j] = s / L[j][j];
    }
  return L;
}
function interpolation(kind, p) {
  let xs = p.xs || [1, 2, 3],
    ys = p.ys || [1, 4, 9],
    x = Number(p.x ?? 2.5);
  if (xs.length !== ys.length || xs.length < 2)
    throw Error("xs และ ys ต้องมีจำนวนเท่ากันอย่างน้อย 2 จุด");
  xs = xs.map((v) => finite(v, "xs"));
  ys = ys.map((v) => finite(v, "ys"));
  x = finite(x, "x");
  uniqueXs(xs);
  let value = 0,
    rows = [];
  if (kind === "Lagrange") {
    for (let i = 0; i < xs.length; i++) {
      let term = ys[i];
      for (let j = 0; j < xs.length; j++)
        if (i !== j) term *= (x - xs[j]) / (xs[i] - xs[j]);
      rows.push({ i, term });
      value += term;
    }
  } else {
    let coef = ys.slice(),
      n = xs.length;
    for (let j = 1; j < n; j++)
      for (let i = n - 1; i >= j; i--)
        coef[i] = (coef[i] - coef[i - 1]) / (xs[i] - xs[i - j]);
    value = coef[n - 1];
    for (let i = n - 2; i >= 0; i--) value = value * (x - xs[i]) + coef[i];
    rows = coef.map((c, i) => ({ order: i, coefficient: c }));
  }
  return result(value, rows);
}
function regression(kind, p) {
  const xs = (p.xs || [1, 2, 3, 4]).map((v) => finite(v, "xs")),
    ys = (p.ys || [2, 3, 5, 4]).map((v) => finite(v, "ys"));
  if (xs.length !== ys.length || xs.length < 2)
    throw Error("xs และ ys ต้องมีจำนวนเท่ากันอย่างน้อย 2 จุด");
  const x = finite(p.x ?? 5, "x");
  let X, beta, value;
  if (kind === "Multiple Linear Regression") {
    const zs = (p.zs || [2, 1, 4, 3]).map((v) => finite(v, "zs"));
    X = p.X || xs.map((v, i) => [1, v, zs[i]]);
    if (
      X.length !== ys.length ||
      !X.length ||
      !Array.isArray(X[0]) ||
      X[0].length < 2 ||
      X.some(
        (r) =>
          !Array.isArray(r) ||
          r.length !== X[0].length ||
          r.some((v) => !Number.isFinite(v)),
      )
    )
      throw Error("X ต้องเป็นเมทริกซ์ตัวเลขที่มีจำนวนแถวตรงกับ ys");
    if (X.length < X[0].length)
      throw Error("จำนวนข้อมูลต้องไม่น้อยกว่าจำนวนสัมประสิทธิ์");
    const features = p.features ?? Array(X[0].length - 1).fill(x);
    if (
      features.length !== X[0].length - 1 ||
      features.some((v) => !Number.isFinite(Number(v)))
    )
      throw Error("features มีจำนวนหรือค่าที่ไม่ถูกต้อง");
    try {
      beta = solveLinear(
        plain(multiply(transpose(X), X)),
        plain(multiply(transpose(X), ys)),
      );
    } catch {
      throw Error(
        "Regression ไม่สามารถคำนวณได้: ตัวแปรอิสระอาจซ้ำหรือมีความสัมพันธ์เชิงเส้น",
      );
    }
    value =
      beta[0] +
      beta.slice(1).reduce((s, v, i) => s + v * Number(features[i]), 0);
  } else {
    const degree = finite(p.degree ?? 2, "degree");
    if (!Number.isInteger(degree) || degree < 0 || degree >= xs.length)
      throw Error("degree ต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึงจำนวนจุด - 1");
    X = xs.map((v) => Array.from({ length: degree + 1 }, (_, i) => v ** i));
    try {
      beta = solveLinear(
        plain(multiply(transpose(X), X)),
        plain(multiply(transpose(X), ys)),
      );
    } catch {
      throw Error(
        "Polynomial Regression ไม่สามารถคำนวณได้: ข้อมูล X อาจซ้ำกันมากเกินไป",
      );
    }
    value = beta.reduce((s, v, i) => s + v * x ** i, 0);
  }
  return result(value, [], { coefficients: beta });
}

function integrate(kind, p) {
  const fx = p.fx || "x^2";
  const a = finite(p.a ?? 0, "a");
  const b = finite(p.b ?? 1, "b");

  const composite = kind.startsWith("Composite");
  const simpson = kind.includes("Simpson");

  let n = composite ? positive(p.n ?? 10, "n") : simpson ? 2 : 1;

  if (!Number.isInteger(n)) {
    throw Error("n ต้องเป็นจำนวนเต็ม");
  }

  // Composite Simpson ต้องมีจำนวนช่วงเป็นเลขคู่
  if (composite && simpson && n % 2 !== 0) {
    n++;
  }

  const h = (b - a) / n;
  const F = (x) => f(fx, x);

  let value = 0;

  if (simpson) {
    value = F(a) + F(b);

    for (let i = 1; i < n; i++) {
      value += (i % 2 === 0 ? 2 : 4) * F(a + i * h);
    }

    value *= h / 3;
  } else {
    value = (F(a) + F(b)) / 2;

    for (let i = 1; i < n; i++) {
      value += F(a + i * h);
    }

    value *= h;
  }

  const rows = Array.from({ length: n + 1 }, (_, i) => ({
    i,
    x: a + i * h,
    fx: F(a + i * h),
  }));

  return result(value, rows, { nUsed: n });
}

function differentiate(kind, p) {
  const fx = p.fx || "x^2",
    x = finite(p.x ?? 2, "x"),
    h = positive(p.h ?? 0.01, "h"),
    order = finite(p.order ?? 1, "order"),
    F = (t) => f(fx, t);
  if (!Number.isInteger(order) || order < 1 || order > 6)
    throw Error("order ต้องเป็นจำนวนเต็มระหว่าง 1 ถึง 6");
  const choose = (n, k) => {
    let v = 1;
    for (let i = 1; i <= k; i++) v = (v * (n - i + 1)) / i;
    return v;
  };
  let value = 0;
  for (let k = 0; k <= order; k++) {
    const offset =
      kind === "Forward Divided Difference"
        ? k
        : kind === "Backward Divided Difference"
          ? k - order
          : k - order / 2;
    const coefficient =
      kind === "Backward Divided Difference"
        ? (-1) ** k * choose(order, k)
        : (-1) ** (order - k) * choose(order, k);
    value += coefficient * F(x + offset * h);
  }
  value /= h ** order;
  return result(value, [
    { x, step: h, derivativeOrder: order, approximation: value },
  ]);
}

// Concrete classes: each overrides calculate(), demonstrating polymorphism.
const makeClass = (Base, name, fn) =>
  class extends Base {
    constructor() {
      super(name);
    }
    calculate(input = {}) {
      return fn(name, input);
    }
  };
export const methodGroups = {
  "Root of Equation": [
    [
      "Graphical Method",
      makeClass(RootFindingMethod, "Graphical Method", (_, p) =>
        rootRun("Graphical Method", p),
      ),
    ],
    [
      "Bisection Method",
      makeClass(RootFindingMethod, "Bisection Method", (_, p) =>
        rootRun("Bisection", p),
      ),
    ],
    [
      "False Position Method",
      makeClass(RootFindingMethod, "False Position Method", (_, p) =>
        rootRun("False Position", p),
      ),
    ],
    [
      "One Point Iteration Method",
      makeClass(RootFindingMethod, "One Point Iteration Method", (_, p) =>
        rootRun("One Point Iteration", p),
      ),
    ],
    [
      "Newton-Raphson Method",
      makeClass(RootFindingMethod, "Newton-Raphson Method", (_, p) =>
        rootRun("Newton-Raphson", p),
      ),
    ],
    [
      "Secant Method",
      makeClass(RootFindingMethod, "Secant Method", (_, p) =>
        rootRun("Secant", p),
      ),
    ],
  ],
  "Linear Algebra": [
    [
      "Cramer's Rule",
      makeClass(LinearAlgebraMethod, "Cramer's Rule", (_, p) =>
        linearRun("Cramer Rule", p),
      ),
    ],
    [
      "Gauss Elimination Method",
      makeClass(LinearAlgebraMethod, "Gauss Elimination Method", (_, p) =>
        linearRun("Gauss Elimination", p),
      ),
    ],
    [
      "Gauss Jordan Method",
      makeClass(LinearAlgebraMethod, "Gauss Jordan Method", (_, p) =>
        linearRun("Gauss Jordan", p),
      ),
    ],
    [
      "Matrix Inversion Method",
      makeClass(LinearAlgebraMethod, "Matrix Inversion Method", (_, p) =>
        linearRun("Matrix Inversion", p),
      ),
    ],
    [
      "LU Decomposition Method",
      makeClass(LinearAlgebraMethod, "LU Decomposition Method", (_, p) =>
        linearRun("LU Decomposition", p),
      ),
    ],
    [
      "Cholesky Decomposition Method",
      makeClass(LinearAlgebraMethod, "Cholesky Decomposition Method", (_, p) =>
        linearRun("Cholesky Decomposition", p),
      ),
    ],
    [
      "Jacobi Iteration Method",
      makeClass(LinearAlgebraMethod, "Jacobi Iteration Method", (_, p) =>
        linearRun("Jacobi", p),
      ),
    ],
    [
      "Gauss Seidel Iteration Method",
      makeClass(LinearAlgebraMethod, "Gauss Seidel Iteration Method", (_, p) =>
        linearRun("Gauss-Seidel", p),
      ),
    ],
    [
      "Conjugate Gradient Method",
      makeClass(LinearAlgebraMethod, "Conjugate Gradient Method", (_, p) =>
        linearRun("Conjugate Gradient", p),
      ),
    ],
  ],
  Interpolation: [
    [
      "Newton's Divided-Difference",
      makeClass(InterpolationMethod, "Newton's Divided-Difference", (_, p) =>
        interpolation("Newton", p),
      ),
    ],
    [
      "Lagrange Interpolation",
      makeClass(InterpolationMethod, "Lagrange Interpolation", (_, p) =>
        interpolation("Lagrange", p),
      ),
    ],
  ],
  Extrapolation: [
    [
      "Polynomial Regression",
      makeClass(ExtrapolationMethod, "Polynomial Regression", (_, p) =>
        regression("Polynomial Regression", p),
      ),
    ],
    [
      "Multiple Linear Regression",
      makeClass(ExtrapolationMethod, "Multiple Linear Regression", (_, p) =>
        regression("Multiple Linear Regression", p),
      ),
    ],
  ],
  Integration: [
    [
      "Single Trapezoidal Rule",
      makeClass(IntegrationMethod, "Single Trapezoidal Rule", (_, p) =>
        integrate("Single Trapezoidal", p),
      ),
    ],
    [
      "Composite Trapezoidal Rule",
      makeClass(IntegrationMethod, "Composite Trapezoidal Rule", (_, p) =>
        integrate("Composite Trapezoidal", p),
      ),
    ],
    [
      "Single Simpson's Rule",
      makeClass(IntegrationMethod, "Single Simpson's Rule", (_, p) =>
        integrate("Single Simpson", p),
      ),
    ],
    [
      "Composite Simpson's Rule",
      makeClass(IntegrationMethod, "Composite Simpson's Rule", (_, p) =>
        integrate("Composite Simpson", p),
      ),
    ],
  ],
  Differentiation: [
    [
      "Forward Divided Difference",
      makeClass(DifferentiationMethod, "Forward Divided Difference", (_, p) =>
        differentiate("Forward Divided Difference", p),
      ),
    ],
    [
      "Backward Divided Difference",
      makeClass(DifferentiationMethod, "Backward Divided Difference", (_, p) =>
        differentiate("Backward Divided Difference", p),
      ),
    ],
    [
      "Central Divided Difference",
      makeClass(DifferentiationMethod, "Central Divided Difference", (_, p) =>
        differentiate("Central Divided Difference", p),
      ),
    ],
  ],
};
export const methodRegistry = Object.freeze(
  Object.fromEntries(
    Object.entries(methodGroups).flatMap(([category, items]) =>
      items.map(([label, Factory]) => {
        const instance = new Factory();
        NumericalMethodContract.validate(instance);
        return [`${category}::${label}`, instance];
      }),
    ),
  ),
);
