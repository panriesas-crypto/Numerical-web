import Preset from "./models/Preset.js";
const rows = [];
const add = (category, methods, input) =>
  methods.forEach((method) =>
    rows.push({
      category,
      method,
      title: `Example - ${method}`,
      input,
      description: "Preset example seeded for project demonstration",
    }),
  );
add(
  "Root of Equation",
  [
    "Graphical Method",
    "Bisection Method",
    "False Position Method",
    "One Point Iteration Method",
    "Newton-Raphson Method",
    "Secant Method",
  ],
  {
    fx: "x^2-2",
    a: 1,
    b: 2,
    x0: 1.5,
    x1: 2,
    tol: 0.000001,
    maxIter: 100,
    gx: "(x+2/x)/2",
  },
);
add(
  "Linear Algebra",
  [
    "Cramer's Rule",
    "Gauss Elimination Method",
    "Gauss Jordan Method",
    "Matrix Inversion Method",
    "LU Decomposition Method",
    "Cholesky Decomposition Method",
    "Jacobi Iteration Method",
    "Gauss Seidel Iteration Method",
    "Conjugate Gradient Method",
  ],
  {
    A: [
      [4, 1],
      [1, 3],
    ],
    b: [1, 2],
    tol: 1e-8,
    maxIter: 100,
  },
);
add(
  "Interpolation",
  ["Newton's Divided-Difference", "Lagrange Interpolation"],
  { xs: [1, 2, 3], ys: [1, 4, 9], x: 2.5 },
);
add("Extrapolation", ["Polynomial Regression", "Multiple Linear Regression"], {
  xs: [1, 2, 3, 4],
  ys: [2, 3, 5, 4],
  zs: [1, 2, 3, 4],
  x: 5,
  degree: 2,
  features: [5, 5],
});
add(
  "Integration",
  [
    "Single Trapezoidal Rule",
    "Composite Trapezoidal Rule",
    "Single Simpson's Rule",
    "Composite Simpson's Rule",
  ],
  { fx: "x^2", a: 0, b: 1, n: 10 },
);
add(
  "Differentiation",
  [
    "Forward Divided Difference",
    "Backward Divided Difference",
    "Central Divided Difference",
  ],
  { fx: "x^2", x: 2, h: 0.01, order: 1 },
);
export async function seedPresets() {
  for (const row of rows)
    await Preset.updateOne(
      { category: row.category, method: row.method, title: row.title },
      { $setOnInsert: row },
      { upsert: true },
    );
  console.log(`Preset examples ready: ${rows.length}`);
}
