
function drawFunctionGraph(a, b, root) {
    const canvas = document.getElementById("functionCanvas");
    if (!canvas) return;

    if (
        !Number.isFinite(a) ||
        !Number.isFinite(b) ||
        !Number.isFinite(root) ||
        a >= b
    ) {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    if (width <= 0 || height <= 0) return;

    ctx.clearRect(0, 0, width, height);

    // กำหนดขอบเขตแกน X
    const padding = (b - a) * 0.5;
    const xMin = a - padding;
    const xMax = b + padding;

    // ขอบเขตแกน Y สำหรับ f(x) = x² - 2
    const yA = a * a - 2;
    const yB = b * b - 2;
    const yMin = Math.min(-2, yA, yB);
    const yMax = Math.max(2, yA, yB);

    const toX = x =>
        ((x - xMin) / (xMax - xMin)) * width;

    const toY = y =>
        height - ((y - yMin) / (yMax - yMin)) * height;

    // วาดแกน X และ Y เมื่อแกนนั้นอยู่ในช่วงที่มองเห็น
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    ctx.beginPath();

    if (yMin <= 0 && yMax >= 0) {
        ctx.moveTo(0, toY(0));
        ctx.lineTo(width, toY(0));
    }

    if (xMin <= 0 && xMax >= 0) {
        ctx.moveTo(toX(0), 0);
        ctx.lineTo(toX(0), height);
    }

    ctx.stroke();

    // วาดกราฟ f(x) = x² - 2
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= width; i++) {
        const x = xMin + (i / width) * (xMax - xMin);
        const y = x * x - 2;

        if (i === 0) {
            ctx.moveTo(toX(x), toY(y));
        } else {
            ctx.lineTo(toX(x), toY(y));
        }
    }

    ctx.stroke();

    // วาดจุดรากเมื่ออยู่ในขอบเขตกราฟ
    if (root >= xMin && root <= xMax) {
        const rootX = toX(root);
        const rootY = toY(0);

        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(rootX, rootY, 6, 0, Math.PI * 2);
        ctx.fill();

        const label = `Root ≈ ${root.toFixed(6)}`;

        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#dc2626";

        const labelWidth = ctx.measureText(label).width;

        const textX =
            rootX + labelWidth + 12 > width
                ? rootX - labelWidth - 8
                : rootX + 8;

        ctx.fillText(label, textX, rootY - 10);
    }
}
