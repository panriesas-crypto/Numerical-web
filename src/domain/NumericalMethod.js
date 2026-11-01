/** Runtime interface contract: JavaScript has no native interface keyword. */
export const NumericalMethodContract = Object.freeze({
  validate(instance) {
    for (const key of ['name','category','calculate']) {
      if (!(key in instance) || (key === 'calculate' && typeof instance[key] !== 'function'))
        throw new TypeError(`Numerical method contract requires ${key}`);
    }
    return true;
  }
});

/** Abstract base class. Private fields provide encapsulation. */
export class NumericalMethod {
  #name; #category;
  constructor(name, category) {
    if (new.target === NumericalMethod) throw new TypeError('NumericalMethod is abstract');
    if (!name || !category) throw new TypeError('name and category are required');
    this.#name = name; this.#category = category;
  }
  get name(){return this.#name;}
  get category(){return this.#category;}
  calculate(){throw new Error(`${this.#name} must override calculate()`);}
}
export class RootFindingMethod extends NumericalMethod { constructor(name){super(name,'Root of Equation');} }
export class LinearAlgebraMethod extends NumericalMethod { constructor(name){super(name,'Linear Algebra');} }
export class InterpolationMethod extends NumericalMethod { constructor(name){super(name,'Interpolation');} }
export class ExtrapolationMethod extends NumericalMethod { constructor(name){super(name,'Extrapolation');} }
export class IntegrationMethod extends NumericalMethod { constructor(name){super(name,'Integration');} }
export class DifferentiationMethod extends NumericalMethod { constructor(name){super(name,'Differentiation');} }
