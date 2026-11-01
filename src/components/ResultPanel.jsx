
import React from "react";

const numeric = (v, digits = 6) =>
  typeof v === "number" && Number.isFinite(v)
    ? v.toFixed(digits)
    : String(v ?? "—");

export default function ResultPanel({ result }) {
  if (!result) return null;

  const rows = result.rows || [];

  const isRootTable =
    result.category === "Root of Equation" &&
    [
      "Bisection Method",
      "False Position Method"
    ].includes(result.method) &&
    rows.some(row => "errorPercent" in row);

  const columns = isRootTable
    ? [
        { k: "iteration", label: "Iter" },
        { k: "x", label: "xₖ" },
        { k: "fx", label: "f(xₖ)" },
        { k: "errorPercent", label: "Error (%)" }
      ]
    : Object.keys(rows[0] || {}).map(k => ({
        k,
        label: k
      }));

  return (
    <section className="nm-results">
      <h3>Numerical Result</h3>

      <p className="nm-result-value">
        {typeof result.value === "number"
          ? numeric(result.value, 10)
          : JSON.stringify(result.value)}
      </p>

      {result.residual !== undefined && (
        <p className="nm-muted">
          Residual: {numeric(result.residual, 10)}
        </p>
      )}

      {result.coefficients && (
        <p className="nm-muted">
          Coefficients: {JSON.stringify(result.coefficients)}
        </p>
      )}

      {result.converged === false && (
        <p className="nm-error">
          ยังไม่เข้าเงื่อนไขการลู่เข้า
        </p>
      )}

      <h3>Iterations</h3>

      {rows.length ? (
        <div className="nm-table-scroll">
          <table className="nm-table">
            <thead>
              <tr>
                {columns.map(c => (
                  <th key={c.k}>{c.label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map(c => (
                    <td key={c.k}>
                      {row[c.k] == null
                        ? "—"
                        : typeof row[c.k] === "number"
                          ? numeric(
                              row[c.k],
                              c.k === "iteration"
                                ? 0
                                : c.k === "errorPercent"
                                  ? 4
                                  : 6
                            )
                          : String(row[c.k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="nm-muted">
          ไม่มีตาราง Iteration สำหรับวิธีนี้
        </p>
      )}
    </section>
  );
}
