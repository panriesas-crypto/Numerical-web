import { methodRegistry } from "../domain/algorithms.js";
/** Composition: service owns/uses a registry of interchangeable method objects. */
export class CalculatorService {
  #registry;
  constructor(registry = methodRegistry) {
    this.#registry = registry;
  }
  list() {
    return Object.entries(this.#registry).map(([key, m]) => ({
      key,
      name: m.name,
      category: m.category,
    }));
  }
  calculate(key, input) {
    const method = this.#registry[key];
    if (!method) throw new Error("ไม่พบ Numerical Method ที่เลือก");
    return {
      method: method.name,
      category: method.category,
      ...method.calculate(input),
    };
  }
}
