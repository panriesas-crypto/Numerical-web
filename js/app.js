document.addEventListener("DOMContentLoaded", () => {
  const valueA = document.getElementById("valueA");
  const valueB = document.getElementById("valueB");
  const tolerance = document.getElementById("tolerance");
  const maxIterations = document.getElementById("maxIterations");

  const runButton = document.getElementById("runButton");
  const resultValue = document.getElementById("resultValue");
  const resultDetails = document.getElementById("resultDetails");
  const errorMessage = document.getElementById("errorMessage");
  const tableBody = document.getElementById("tableBody");
  const formulaDescription = document.getElementById("formulaDescription");

  // ฟังก์ชันตัวอย่าง: f(x) = x² - 2
  function f(x) {
    return x * x - 2;
  }

  // Bisection Method
  function bisection(a, b, tol, maxIter) {
    function f(x) {
      return x * x - 2;
    }

    if (![a, b, tol].every(Number.isFinite)) {
      throw new Error("ค่าที่รับมาต้องเป็นตัวเลขที่ถูกต้อง");
    }

    if (a >= b) {
      throw new Error("ค่า a ต้องน้อยกว่า b");
    }

    if (tol <= 0) {
      throw new Error("Tolerance ต้องมากกว่า 0");
    }

    if (!Number.isInteger(maxIter) || maxIter < 1) {
      throw new Error("Max Iterations ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป");
    }

    const fa = f(a);
    const fb = f(b);

    if (fa === 0) {
      return { root: a, rows: [], converged: true };
    }

    if (fb === 0) {
      return { root: b, rows: [], converged: true };
    }

    if (fa * fb > 0) {
      throw new Error("f(a) และ f(b) ต้องมีเครื่องหมายต่างกัน");
    }

    const rows = [];
    let c = a;
    let previousC = null;
    let converged = false;

    for (let i = 1; i <= maxIter; i++) {
      c = a + (b - a) / 2;

      const fc = f(c);
      const error = previousC === null ? null : Math.abs(c - previousC);

      rows.push({
        iteration: i,
        a,
        b,
        c,
        fc,
        error,
      });

      if (fc === 0 || (b - a) / 2 <= tol) {
        converged = true;
        break;
      }

      if (fa === 0) {
        return { root: a, rows, converged: true };
      }

      if (f(a) * fc < 0) {
        b = c;
      } else {
        a = c;
      }

      previousC = c;
    }

    return { root: c, rows, converged };
  }

  runButton.addEventListener("click", () => {
    errorMessage.textContent = "";
    tableBody.innerHTML = "";

    try {
      const a = Number(valueA.value);
      const b = Number(valueB.value);
      const tol = Number(tolerance.value);
      const maxIter = Number(maxIterations.value);

      if (
        valueA.value.trim() === "" ||
        valueB.value.trim() === "" ||
        tolerance.value.trim() === "" ||
        maxIterations.value.trim() === ""
      ) {
        throw new Error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      }

      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        throw new Error("ค่า a และ b ต้องเป็นตัวเลขที่ถูกต้อง");
      }

      if (a >= b) {
        throw new Error("ค่า a ต้องน้อยกว่า b");
      }

      if (!Number.isFinite(tol) || tol <= 0) {
        throw new Error("Tolerance ต้องมากกว่า 0");
      }

      if (!Number.isInteger(maxIter) || maxIter < 1) {
        throw new Error("Max Iterations ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป");
      }

      const result = bisection(a, b, tol, maxIter);

      resultValue.textContent = result.root.toFixed(10);
      resultDetails.textContent = `คำนวณทั้งหมด ${result.rows.length} รอบ`;

      formulaDescription.textContent = "Bisection Method: f(x) = x² - 2";

      result.rows.forEach((row) => {
        const tr = document.createElement("tr");

        [
          row.iteration,
          row.a.toFixed(6),
          row.b.toFixed(6),
          row.c.toFixed(6),
          row.fc.toFixed(6),
          Number.isFinite(row.error) ? row.error.toExponential(3) : "-",
        ].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });

        tableBody.appendChild(tr);
      });
      drawFunctionGraph(a, b, result.root);
    } catch (error) {
      errorMessage.textContent = error.message;
      resultValue.textContent = "-";
      resultDetails.textContent = "ไม่สามารถคำนวณได้";
    }
  });
});
