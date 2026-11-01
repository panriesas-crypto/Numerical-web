# Numerical Method Calculator Website (OOP Edition)

A React + Vite frontend and Express + MongoDB API implementing the six Numerical Method categories listed in the supplied project document.

## Requirements
- Node.js 20+ and npm
- MongoDB 7+ (optional for local calculation; required for persistent presets)

## Run the frontend
```bash
npm install
npm run dev
```
Open http://localhost:5173. Numerical calculations run in the browser and do not require the API.

## Run the API + MongoDB
1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Start MongoDB locally, then run:
```bash
npm --prefix backend install
npm run server
```
API: http://localhost:4000/api/health  
Swagger: http://localhost:4000/api-docs

Alternatively start MongoDB and API with `docker compose up --build`.

## Save a preset
Send POST `/api/presets` with JSON, e.g.
```json
{
  "category":"Root of Equation",
  "method":"Bisection Method",
  "title":"Square root of 2",
  "input":{"fx":"x^2-2","a":1,"b":2,"tol":0.000001,"maxIter":100},
  "description":"Find the positive root of x^2-2"
}
```
The UI's Fill Form button requests the first matching preset. When MongoDB/API is unavailable, the local sample remains usable.

## Project structure
- `src/domain/NumericalMethod.js`: abstract base classes and runtime interface contract.
- `src/domain/algorithms.js`: concrete method objects and algorithms.
- `src/services/CalculatorService.js`: composition; owns a registry and delegates to a selected method.
- `src/components`: result table and Plotly graph components.
- `src/services/api.js`: Axios API client.
- `backend/src/models/Preset.js`: Mongoose schema.
- `backend/src/routes/presets.js`: preset REST endpoints.

## OOP mapping
1. Abstract Class: `NumericalMethod` rejects direct construction and defines the `calculate()` contract.
2. Interface: `NumericalMethodContract.validate()` checks required `name`, `category`, and `calculate()` members at runtime. JavaScript has no native interface keyword; this is a runtime structural contract, not a TypeScript compile-time interface.
3. Inheritance: category base classes extend `NumericalMethod`; concrete method classes extend the category base.
4. Polymorphism: each concrete class overrides `calculate()`. `CalculatorService` calls the same method without branching on algorithm type.
5. Encapsulation: private fields `#name`, `#category` in `NumericalMethod`; private `#registry` in `CalculatorService`.
6. Composition: `CalculatorService` contains/uses the method registry; React `App` composes form, graph, and result components.

## Important numerical notes
- The UI accepts JSON parameters. Each category has an editable working example.
- Linear-system solvers include hand-coded Gaussian elimination, Gauss-Jordan, LU decomposition, Cholesky decomposition, Jacobi, Gauss-Seidel, and Conjugate Gradient implementations; matrix inversion and determinant operations use math.js.
- Graphical Method uses a numerical scan to locate a point with small `|f(x)|`.
- Regression and iterative methods should be checked against course test cases, especially ill-conditioned inputs.
- On first successful MongoDB connection, the backend seeds example presets for the methods in the project scope. No remote database credentials are bundled.


## Input parameter reference

| Category | JSON fields | Example meaning |
|---|---|---|
| Root of Equation | `fx`, `a`, `b`, `x0`, `x1`, `gx`, `tol`, `maxIter` | Function, interval/initial values, iteration controls; One Point uses `gx`. |
| Linear Algebra | `A`, `b`, `tol`, `maxIter` | Coefficient matrix, right-hand-side vector, stopping settings. |
| Interpolation | `xs`, `ys`, `x` | Known data points and target x. |
| Extrapolation | `xs`, `ys`, `x`, `degree`; optionally `X`, `features` | Regression data, prediction point, polynomial degree or design matrix. |
| Integration | `fx`, `a`, `b`, `n` | Function, integration bounds, number of subintervals. |
| Differentiation | `fx`, `x`, `h`, `order` | Function, evaluation point, step size, derivative order (1–6). |

The browser interface uses an editable JSON input area so every algorithm can accept its own parameters without a separate form being hard-coded for each method.
