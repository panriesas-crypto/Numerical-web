
function drawFunctionGraph(a, b, root) {
    const canvas = document.getElementById("functionCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // ขอบเขตของกราฟ
    const xMin = a - (b - a) * 0.5;
    const xMax = b + (b - a) * 0.5;
    const yMin = -2;
    const yMax = Math.max(2, xMax * xMax);

    const toX = x => (x - xMin) / (xMax - xMin) * width;
    const toY = y => height - (y - yMin) / (yMax - yMin) * height;

    // วาดแกน X และ Y
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, toY(0));
    ctx.lineTo(width, toY(0));
    ctx.moveTo(toX(0), 0);
    ctx.lineTo(toX(0), height);
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

    // ทำเครื่องหมายตำแหน่งราก
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(toX(root), toY(0), 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#dc2626";
    ctx.font = "14px sans-serif";
    ctx.fillText(`Root ≈ ${root.toFixed(6)}`, toX(root) + 8, toY(0) - 10);
}
