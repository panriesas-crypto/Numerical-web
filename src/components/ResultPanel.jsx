import React from "react";
export default function ResultPanel({ result }) {
  if (!result) return <p className="muted">ผลลัพธ์จะแสดงหลังจากกด Calculate</p>;
  return (
    <section className="panel">
      <h3>ผลลัพธ์</h3>
      <p className="answer">
        {typeof result.value === "number"
          ? Number(result.value).toPrecision(12)
          : JSON.stringify(result.value)}
      </p>
      <p className="muted">
        {result.method} · {result.category}{" "}
        {result.converged === false ? "· ยังไม่เข้าเงื่อนไข convergence" : ""}
      </p>
      {result.coefficients && (
        <p>Coefficients: {JSON.stringify(result.coefficients)}</p>
      )}
      {result.residual !== undefined && <p>Residual: {result.residual}</p>}
      <h4>Step-by-Step / Iteration</h4>
      {result.rows?.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {Object.keys(result.rows[0]).map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j}>
                      {typeof v === "number"
                        ? Number(v).toPrecision(7)
                        : String(v ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">วิธีนี้คืนผลลัพธ์โดยไม่มีตารางวนซ้ำ</p>
      )}
    </section>
  );
}
