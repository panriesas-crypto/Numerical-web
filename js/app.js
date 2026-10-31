document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const methodSelect = document.getElementById("method");
  const valueA = document.getElementById("valueA");
  const valueB = document.getElementById("valueB");
  const tolerance = document.getElementById("tolerance");
  const maxIterations = document.getElementById("maxIterations");
  const runButton = document.getElementById("runButton");
  const resultValue = document.getElementById("resultValue");
  const resultDetails = document.getElementById("resultDetails");
  const errorMessage = document.getElementById("errorMessage");
  const tableBody = document.getElementById("tableBody");
  const tableHead = document.getElementById("tableHead");
  const formulaDescription = document.getElementById("formulaDescription");
  const graphDescription = document.getElementById("graphDescription");
  const labelA = document.querySelector('label[for="valueA"]');
  const labelB = document.querySelector('label[for="valueB"]');

  const expression = "x^2 - 2";

  // This version currently implements Root Finding methods.
  // Other category options are kept in the UI for future development.
  function updateMethodControls() {
    const isRoot = categorySelect.value === "root";
    methodSelect.disabled = !isRoot;
    runButton.disabled = !isRoot;

    if (!isRoot) {
      errorMessage.textContent = "หมวดหมู่นี้ยังไม่ได้เชื่อมต่อกับระบบ OOP เวอร์ชันนี้ กรุณาเลือก Root Finding";
      return;
    }

    errorMessage.textContent = "";
    const isNewton = methodSelect.value === "newton";
    labelA.textContent = isNewton ? "Initial Guess (x₀)" : "Lower Bound / Initial x₀ (a)";
    labelB.textContent = isNewton ? "(ไม่ใช้สำหรับ Newton)" : "Upper Bound / Initial x₁ (b)";
    valueB.disabled = isNewton;

    const selected = numericalMethods[methodSelect.value];
    formulaDescription.textContent = `${selected.name}: f(x) = ${expression}`;
  }

  categorySelect.addEventListener("change", updateMethodControls);
  methodSelect.addEventListener("change", updateMethodControls);

  function clearResults() {
    tableBody.innerHTML = "";
    resultValue.textContent = "-";
    resultDetails.textContent = "ผลลัพธ์จะแสดงหลังจากกด Run";
    graphDescription.textContent = "กราฟฟังก์ชัน f(x) = x² - 2";
    errorMessage.textContent = "";
  }

  function renderTable(rows) {
    tableHead.innerHTML = `
      <tr>
        <th>Iteration</th>
        <th>a / x₀</th>
        <th>b / x₁</th>
        <th>c / x ใหม่</th>
        <th>f(c)</th>
        <th>Error</th>
      </tr>`;

    const format = (value) => {
      if (value === null || value === undefined || !Number.isFinite(value)) return "-";
      return Math.abs(value) >= 1e6 || (Math.abs(value) > 0 && Math.abs(value) < 1e-5)
        ? value.toExponential(4)
        : value.toFixed(6);
    };

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      [row.iteration, format(row.a), format(row.b), format(row.c), format(row.fc), format(row.error)]
        .forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
      tableBody.appendChild(tr);
    });
  }

  runButton.addEventListener("click", () => {
    clearResults();

    try {
      if (categorySelect.value !== "root") {
        throw new Error("กรุณาเลือก Root Finding");
      }

      if (valueA.value.trim() === "" || tolerance.value.trim() === "" || maxIterations.value.trim() === "") {
        throw new Error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      }

      const a = Number(valueA.value);
      const b = Number(valueB.value);
      const tol = Number(tolerance.value);
      const maxIter = Number(maxIterations.value);
      const selectedMethod = numericalMethods[methodSelect.value];

      if (!selectedMethod) throw new Error("ไม่พบวิธีคำนวณที่เลือก");

      let result;
      if (methodSelect.value === "newton") {
        result = selectedMethod.calculate(expression, a, undefined, tol, maxIter);
      } else {
        if (valueB.value.trim() === "") throw new Error("กรุณากรอกค่า b");
        result = selectedMethod.calculate(expression, a, b, tol, maxIter);
      }

      resultValue.textContent = result.root.toFixed(10);
      resultDetails.textContent = `${result.method} | คำนวณ ${result.rows.length} รอบ | ${result.converged ? "Converged" : "หยุดเมื่อครบจำนวนรอบที่กำหนด"}`;
      formulaDescription.textContent = `${result.method}: f(x) = ${expression}`;
      renderTable(result.rows);
      drawFunctionGraph(a, methodSelect.value === "newton" ? a + 1 : b, result.root);
    } catch (error) {
      errorMessage.textContent = error.message;
      resultValue.textContent = "-";
      resultDetails.textContent = "ไม่สามารถคำนวณได้";
      tableBody.innerHTML = "";
    }
  });

  updateMethodControls();
});
