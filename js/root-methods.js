/*
 * OOP structure for Root Finding methods.
 * JavaScript has no native abstract class or interface keywords.
 * NumericalMethod simulates an abstract class, while
 * NumericalMethodContract validates the required interface at runtime.
 */

// Interface Contract (structural interface for JavaScript)
const NumericalMethodContract = Object.freeze({
  requiredProperties: ["name"],
  requiredMethods: ["calculate"],

  validate(instance) {
    for (const property of this.requiredProperties) {
      if (!(property in instance)) {
        throw new Error(`Numerical method must provide property: ${property}`);
      }
    }

    for (const method of this.requiredMethods) {
      if (typeof instance[method] !== "function") {
        throw new Error(`Numerical method must implement method: ${method}()`);
      }
    }

    return true;
  },
});

// Abstract Class: base class for every numerical method.
class NumericalMethod {
  constructor(name) {
    if (new.target === NumericalMethod) {
      throw new Error("NumericalMethod is an abstract class and cannot be instantiated directly.");
    }

    if (!name || typeof name !== "string") {
      throw new Error("Method name must be a non-empty string.");
    }

    // Encapsulation: keep the method name in a private field.
    this.#name = name;
  }

  #name;

  get name() {
    return this.#name;
  }

  calculate() {
    throw new Error("Subclass must override calculate().");
  }

  evaluateExpression(expression, x) {
    if (typeof expression !== "string" || expression.trim() === "") {
      throw new Error("กรุณากรอกสมการ f(x)");
    }

    if (typeof math === "undefined") {
      throw new Error("ไม่พบไลบรารี math.js กรุณาตรวจสอบการโหลดไฟล์ใน index.html");
    }

    const compiled = math.compile(expression);
    const value = compiled.evaluate({ x });

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`ไม่สามารถคำนวณ f(${x}) ได้ กรุณาตรวจสอบสมการ`);
    }

    return value;
  }

  validateCommon(a, b, tolerance, maxIterations) {
    if (![a, tolerance, maxIterations].every(Number.isFinite)) {
      throw new Error("กรุณากรอกตัวเลขให้ถูกต้อง");
    }
    if (tolerance <= 0) {
      throw new Error("Tolerance ต้องมากกว่า 0");
    }
    if (!Number.isInteger(maxIterations) || maxIterations < 1) {
      throw new Error("Max Iterations ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป");
    }
    if (b !== undefined && !Number.isFinite(b)) {
      throw new Error("กรุณากรอกค่า b ให้ถูกต้อง");
    }
  }
}

// Abstract intermediate class: all root-finding algorithms inherit from this class.
class RootFindingMethod extends NumericalMethod {
  constructor(name) {
    super(name);
  }

  makeResult(root, rows, converged) {
    return { root, rows, converged, method: this.name };
  }
}

// Inheritance + Polymorphism: each child overrides calculate().
class BisectionMethod extends RootFindingMethod {
  constructor() {
    super("Bisection Method");
  }

  calculate(expression, a, b, tolerance, maxIterations) {
    this.validateCommon(a, b, tolerance, maxIterations);
    if (a >= b) throw new Error("ค่า a ต้องน้อยกว่า b");

    let fa = this.evaluateExpression(expression, a);
    let fb = this.evaluateExpression(expression, b);
    if (fa === 0) return this.makeResult(a, [], true);
    if (fb === 0) return this.makeResult(b, [], true);
    if (fa * fb > 0) throw new Error("f(a) และ f(b) ต้องมีเครื่องหมายต่างกัน");

    const rows = [];
    let previousC = null;
    let c = a;
    let converged = false;

    for (let i = 1; i <= maxIterations; i++) {
      c = (a + b) / 2;
      const fc = this.evaluateExpression(expression, c);
      const error = previousC === null ? null : Math.abs(c - previousC);
      rows.push({ iteration: i, a, b, c, fc, error });

      if (fc === 0 || Math.abs(b - a) / 2 <= tolerance) {
        converged = true;
        break;
      }

      if (fa * fc < 0) {
        b = c;
        fb = fc;
      } else {
        a = c;
        fa = fc;
      }
      previousC = c;
    }

    return this.makeResult(c, rows, converged);
  }
}

class FalsePositionMethod extends RootFindingMethod {
  constructor() {
    super("False Position Method");
  }

  calculate(expression, a, b, tolerance, maxIterations) {
    this.validateCommon(a, b, tolerance, maxIterations);
    if (a >= b) throw new Error("ค่า a ต้องน้อยกว่า b");

    let fa = this.evaluateExpression(expression, a);
    let fb = this.evaluateExpression(expression, b);
    if (fa === 0) return this.makeResult(a, [], true);
    if (fb === 0) return this.makeResult(b, [], true);
    if (fa * fb > 0) throw new Error("f(a) และ f(b) ต้องมีเครื่องหมายต่างกัน");

    const rows = [];
    let previousC = null;
    let c = a;
    let converged = false;

    for (let i = 1; i <= maxIterations; i++) {
      const denominator = fb - fa;
      if (Math.abs(denominator) < 1e-14) throw new Error("False Position: ตัวหารเข้าใกล้ศูนย์");
      c = (a * fb - b * fa) / denominator;
      const fc = this.evaluateExpression(expression, c);
      const error = previousC === null ? null : Math.abs(c - previousC);
      rows.push({ iteration: i, a, b, c, fc, error });

      if (Math.abs(fc) <= tolerance || (error !== null && error <= tolerance)) {
        converged = true;
        break;
      }

      if (fa * fc < 0) {
        b = c;
        fb = fc;
      } else {
        a = c;
        fa = fc;
      }
      previousC = c;
    }

    return this.makeResult(c, rows, converged);
  }
}

class NewtonMethod extends RootFindingMethod {
  constructor() {
    super("Newton-Raphson Method");
  }

  calculate(expression, initialGuess, _unusedB, tolerance, maxIterations) {
    this.validateCommon(initialGuess, undefined, tolerance, maxIterations);

    const rows = [];
    const h = 1e-6;
    let x = initialGuess;
    let converged = false;

    for (let i = 1; i <= maxIterations; i++) {
      const fx = this.evaluateExpression(expression, x);
      const derivative = (
        this.evaluateExpression(expression, x + h) -
        this.evaluateExpression(expression, x - h)
      ) / (2 * h);

      if (Math.abs(derivative) < 1e-14) {
        throw new Error("อนุพันธ์มีค่าใกล้ศูนย์ วิธี Newton ไม่สามารถดำเนินต่อได้");
      }

      const nextX = x - fx / derivative;
      const error = Math.abs(nextX - x);
      const nextFx = this.evaluateExpression(expression, nextX);
      rows.push({ iteration: i, a: x, b: null, c: nextX, fc: nextFx, error });

      x = nextX;
      if (error <= tolerance || Math.abs(nextFx) <= tolerance) {
        converged = true;
        break;
      }
    }

    return this.makeResult(x, rows, converged);
  }
}

class SecantMethod extends RootFindingMethod {
  constructor() {
    super("Secant Method");
  }

  calculate(expression, a, b, tolerance, maxIterations) {
    this.validateCommon(a, b, tolerance, maxIterations);
    if (a === b) throw new Error("ค่าเริ่มต้น a และ b ต้องไม่เท่ากัน");

    let x0 = a;
    let x1 = b;
    const rows = [];
    let converged = false;

    for (let i = 1; i <= maxIterations; i++) {
      const f0 = this.evaluateExpression(expression, x0);
      const f1 = this.evaluateExpression(expression, x1);
      const denominator = f1 - f0;
      if (Math.abs(denominator) < 1e-14) throw new Error("Secant: ตัวหารมีค่าใกล้ศูนย์");

      const x2 = x1 - (f1 * (x1 - x0)) / denominator;
      const fx2 = this.evaluateExpression(expression, x2);
      const error = Math.abs(x2 - x1);
      rows.push({ iteration: i, a: x0, b: x1, c: x2, fc: fx2, error });

      x0 = x1;
      x1 = x2;
      if (error <= tolerance || Math.abs(fx2) <= tolerance) {
        converged = true;
        break;
      }
    }

    return this.makeResult(x1, rows, converged);
  }
}

// Create method objects and check that each one follows the Interface Contract.
const numericalMethods = Object.freeze({
  bisection: new BisectionMethod(),
  falsePosition: new FalsePositionMethod(),
  newton: new NewtonMethod(),
  secant: new SecantMethod(),
});

Object.values(numericalMethods).forEach((method) => {
  NumericalMethodContract.validate(method);
});
