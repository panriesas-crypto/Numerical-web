
import React, { useMemo, useState } from "react";
import { MathJax } from "better-react-mathjax";
import { parse } from "mathjs";
import { methodGroups } from "./domain/algorithms.js";
import { CalculatorService } from "./services/CalculatorService.js";
import { getPresets } from "./services/api.js";
import ResultPanel from "./components/ResultPanel.jsx";
import Graph from "./components/Graph.jsx";

const service = new CalculatorService();
const categories = Object.keys(methodGroups);

const examples = {
  "Root of Equation": {
    fx: "e^(-x)-x",
    a: "0", b: "1",
    x0: "0.5", x1: "1",
    gx: "e^(-x)",
    tolPercent: "0.0001",
    tol: "0.000001",
    maxIter: "100"
  },
  "Linear Algebra": {
    A: "[[4,1],[1,3]]",
    b: "[1,2]",
    tol: "0.00000001",
    maxIter: "100"
  },
  Interpolation: {
    xs: "[1,2,3]",
    ys: "[1,4,9]",
    x: "2.5"
  },
  Extrapolation: {
    xs: "[1,2,3,4]",
    ys: "[2,3,5,4]",
    zs: "[2,1,4,3]",
    x: "5",
    features: "[5,2]",
    degree: "2"
  },
  Integration: {
    fx: "x^2", a: "0", b: "2", n: "10"
  },
  Differentiation: {
    fx: "x^2",
    x: "2", h: "0.01", order: "1"
  }
};

const field = (
  name, label, type = "number", wide = false
) => ({ name, label, type, wide });

function getFields(category, method) {
  const fx = field("fx", "Equation f(x)", "text", true);
  const a = field("a", "x start (a)");
  const b = field("b", "x end (b)");
  const tol = field("tol", "Error Tolerance (absolute)");
  const iterations = field("maxIter", "Max Iterations");

  if (category === "Root of Equation") {
    if (
      method === "Bisection Method" ||
      method === "False Position Method"
    ) {
      return [
        fx, a, b,
        field("tolPercent", "Error Tolerance (%)"),
        iterations
      ];
    }

    if (method === "Newton-Raphson Method") {
      return [
        fx,
        field("x0", "Initial guess (x0)"),
        tol, iterations
      ];
    }

    if (method === "Secant Method") {
      return [
        fx,
        field("x0", "First guess (x0)"),
        field("x1", "Second guess (x1)"),
        tol, iterations
      ];
    }

    if (method === "One Point Iteration Method") {
      return [
        fx,
        field("gx", "Iteration function g(x)", "text", true),
        field("x0", "Initial guess (x0)"),
        tol, iterations
      ];
    }

    return [fx, a, b, tol];
  }

  if (category === "Linear Algebra") {
    const basic = [
      field("A", "Matrix A (JSON)", "json", true),
      field("b", "Vector b (JSON)", "json", true)
    ];

    return /Jacobi|Gauss Seidel|Conjugate Gradient/.test(method)
      ? [...basic, tol, iterations]
      : basic;
  }

  if (category === "Interpolation") {
    return [
      field("xs", "X values (JSON)", "json", true),
      field("ys", "Y values (JSON)", "json", true),
      field("x", "Evaluate at x")
    ];
  }

  if (category === "Extrapolation") {
    const basic = [
      field("xs", "X values (JSON)", "json", true),
      field("ys", "Y values (JSON)", "json", true)
    ];

    return method === "Multiple Linear Regression"
      ? [
          ...basic,
          field("zs", "Z values (JSON)", "json", true),
          field(
            "features",
            "Predict at [x,z] (JSON)",
            "json",
            true
          )
        ]
      : [
          ...basic,
          field("x", "Predict at x"),
          field("degree", "Polynomial degree")
        ];
  }

  if (category === "Integration") {
    const basic = [fx, a, b];

    return method.startsWith("Composite")
      ? [...basic, field("n", "Number of intervals (n)")]
      : basic;
  }

  return [
    fx,
    field("x", "Evaluate at x"),
    field("h", "Step size (h)"),
    field("order", "Derivative order")
  ];
}

function toPayload(fields, form) {
  const payload = {};

  for (const item of fields) {
    const raw = String(form[item.name] ?? "").trim();

    if (!raw) {
      throw new Error(`กรุณากรอก ${item.label}`);
    }

    if (item.type === "json") {
      try {
        payload[item.name] = JSON.parse(raw);
      } catch {
        throw new Error(
          `${item.label} ต้องเป็น JSON ที่ถูกต้อง เช่น [1,2,3]`
        );
      }
    } else if (item.type === "number") {
      const n = Number(raw);

      if (!Number.isFinite(n)) {
        throw new Error(`${item.label} ต้องเป็นตัวเลข`);
      }

      payload[item.name] = n;
    } else {
      payload[item.name] = raw;
    }
  }

  if (payload.tolPercent !== undefined) {
    payload.tol = 1e-12;
  }

  return payload;
}

export default function App() {
  const [category, setCategory] = useState("Root of Equation");
  const [method, setMethod] = useState("False Position Method");

  const [form, setForm] = useState({
    ...examples["Root of Equation"]
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const fields = useMemo(
    () => getFields(category, method),
    [category, method]
  );

  const currentMethods = methodGroups[category].map(
    ([name]) => name
  );

  const showGraph = [
    "Root of Equation",
    "Integration",
    "Differentiation"
  ].includes(category);

  const graphRange = useMemo(() => {
    const a = Number(form.a);
    const b = Number(form.b);

    if (
      String(form.a ?? "").trim() &&
      String(form.b ?? "").trim() &&
      Number.isFinite(a) &&
      Number.isFinite(b) &&
      a < b
    ) {
      return [a, b];
    }

    const x = Number(form.x0 ?? form.x ?? 0);

    return Number.isFinite(x)
      ? [x - 3, x + 3]
      : [-5, 5];
  }, [form.a, form.b, form.x0, form.x]);

  const latex = useMemo(() => {
    try {
      return parse(form.fx || "x").toTex();
    } catch {
      return null;
    }
  }, [form.fx]);

  const setValue = (name, value) => {
    setForm(old => ({
      ...old,
      [name]: value
    }));

    setResult(null);
    setError("");
  };

  const changeCategory = (next) => {
    setCategory(next);
    setMethod(methodGroups[next][0][0]);
    setForm({ ...examples[next] });
    setResult(null);
    setError("");
    setStatus("");
  };

  const calculate = (event) => {
    event.preventDefault();

    try {
      const payload = toPayload(fields, form);
      const data = service.calculate(
        `${category}::${method}`,
        payload
      );

      setResult(data);
      setError("");
    } catch (e) {
      setResult(null);
      setError(e.message || "คำนวณไม่สำเร็จ");
    }
  };

  const fillForm = async () => {
    const fallback = { ...examples[category] };

    setForm(fallback);
    setResult(null);
    setError("");

    try {
      const data = await getPresets(category, method);

      if (data?.preset?.input) {
        const preset = Object.fromEntries(
          Object.entries(data.preset.input).map(
            ([k, v]) => [
              k,
              typeof v === "object"
                ? JSON.stringify(v)
                : String(v)
            ]
          )
        );

        setForm({ ...fallback, ...preset });
        setStatus("โหลดตัวอย่างจากฐานข้อมูลสำเร็จ");
      } else {
        setStatus("ใช้ข้อมูลตัวอย่างในโปรเจกต์");
      }
    } catch {
      setStatus(
        "ใช้ข้อมูลตัวอย่างในโปรเจกต์ (Backend ไม่ได้เชื่อมต่อ)"
      );
    }
  };

  const clearForm = () => {
    setForm(
      Object.fromEntries(
        fields.map(f => [f.name, ""])
      )
    );
    setResult(null);
    setError("");
    setStatus("");
  };

  return (
    <main className="nm-page">
      <header className="nm-heading">
        <h1>Numerical Method Calculator</h1>
        <p>Numerical Methods for Engineers</p>
      </header>

      <div className="nm-switcher">
        <label>
          Category
          <select
            value={category}
            onChange={e => changeCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Formula / Method
          <select
            value={method}
            onChange={e => {
              setMethod(e.target.value);
              setResult(null);
              setError("");
              setStatus("");
            }}
          >
            {currentMethods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>

      <section className="nm-calculator">
        <h2>{method}</h2>

        <form onSubmit={calculate}>
          {fields.some(f => f.name === "fx") && (
            <div className="nm-equation-row">
              <label className="nm-field">
                Equation f(x)
                <input
                  type="text"
                  value={form.fx ?? ""}
                  onChange={e =>
                    setValue("fx", e.target.value)
                  }
                  placeholder="e^(-x)-x"
                />
              </label>

              <div className="nm-equation-preview">
                {latex ? (
                  <MathJax dynamic>
                    {`\\(f(x) = ${latex}\\)`}
                  </MathJax>
                ) : (
                  <span className="nm-muted">
                    กรอกสมการที่ถูกต้องเพื่อดูรูปแบบคณิตศาสตร์
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="nm-fields">
            {fields
              .filter(
                f => f.name !== "fx" &&
                     f.name !== "maxIter"
              )
              .map(f => (
                <label
                  key={f.name}
                  className={`nm-field ${
                    f.wide ? "nm-field-wide" : ""
                  }`}
                >
                  {f.label}

                  {f.type === "json" ? (
                    <textarea
                      rows={f.name === "A" ? 3 : 2}
                      value={form[f.name] ?? ""}
                      onChange={e =>
                        setValue(f.name, e.target.value)
                      }
                    />
                  ) : (
                    <input
                      type={
                        f.type === "text"
                          ? "text"
                          : "number"
                      }
                      step={
                        ["n", "degree", "order"].includes(f.name)
                          ? "1"
                          : "any"
                      }
                      value={form[f.name] ?? ""}
                      onChange={e =>
                        setValue(f.name, e.target.value)
                      }
                    />
                  )}
                </label>
              ))}
          </div>

          {fields.some(f => f.name === "maxIter") && (
            <details className="nm-advanced">
              <summary>Advanced Settings</summary>

              <label className="nm-field">
                Max Iterations
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxIter ?? ""}
                  onChange={e =>
                    setValue("maxIter", e.target.value)
                  }
                />
              </label>
            </details>
          )}

          <div className="nm-actions">
            <button
              type="submit"
              className="nm-btn nm-primary"
            >
              Calculate
            </button>

            <button
              type="button"
              className="nm-btn nm-green"
              onClick={fillForm}
            >
              Fill Form
            </button>

            <button
              type="button"
              className="nm-btn nm-red"
              onClick={clearForm}
            >
              Clear Form
            </button>
          </div>
        </form>

        {status && (
          <p className="nm-status" role="status">
            {status}
          </p>
        )}

        {error && (
          <p className="nm-error" role="alert">
            {error}
          </p>
        )}

        <ResultPanel result={result} />

        {showGraph && (
          <section className="nm-graph-section">
            <h3>Graph</h3>

            {result ? (
              <Graph
                expression={form.fx || "x^2-2"}
                range={graphRange}
                result={result}
              />
            ) : (
              <p className="nm-muted">
                กราฟจะแสดงหลังจากกด Calculate
              </p>
            )}
          </section>
        )}
      </section>

      <footer className="nm-footer">
        Numerical Method Calculator · React · OOP
      </footer>
    </main>
  );
}
