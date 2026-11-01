import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";
import { evaluate } from "mathjs";
export default function Graph({ expression, range = [-5, 5], result }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !expression) return;
    try {
      const xs = Array.from(
          { length: 201 },
          (_, i) => range[0] + ((range[1] - range[0]) * i) / 200,
        ),
        ys = xs.map((x) => {
          try {
            return evaluate(expression, { x });
          } catch {
            return NaN;
          }
        });
      const traces = [
        { x: xs, y: ys, type: "scatter", mode: "lines", name: "f(x)" },
        { x: [0], y: [0], type: "scatter", mode: "markers", name: "Origin" },
      ];
      if (
        typeof result?.value === "number" &&
        result.category === "Root of Equation"
      )
        traces.push({
          x: [result.value],
          y: [evaluate(expression, { x: result.value })],
          type: "scatter",
          mode: "markers",
          name: "Approx. root",
          marker: { size: 11 },
        });
      Plotly.react(
        ref.current,
        traces,
        {
          margin: { t: 25, r: 20, b: 45, l: 55 },
          xaxis: { title: "x" },
          yaxis: { title: "f(x)" },
          autosize: true,
        },
        { responsive: true, displaylogo: false },
      );
    } catch {}
    return () => {
      if (ref.current) Plotly.purge(ref.current);
    };
  }, [expression, range, result]);
  return <div className="graph" ref={ref} />;
}
