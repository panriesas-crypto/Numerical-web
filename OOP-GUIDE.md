# OOP guide — implementation map

| Concept | File / code | Explanation |
|---|---|---|
| Abstract Class | `src/domain/NumericalMethod.js` → `NumericalMethod` | Cannot instantiate the base class; `calculate()` throws unless overridden. |
| Interface | `NumericalMethodContract.validate()` | Runtime structural contract for `name`, `category`, and `calculate()`. |
| Inheritance | `RootFindingMethod`, `LinearAlgebraMethod`, etc. | Category classes extend `NumericalMethod`; concrete methods extend a category class. |
| Polymorphism | concrete classes in `algorithms.js` | Every object implements `calculate(input)` differently; service calls the same interface. |
| Encapsulation | `#name`, `#category`, `#registry` | Private fields are accessed through controlled public methods/getters. |
| Composition | `CalculatorService` | Service has a registry of method objects and delegates calculations to them. |

## Why not use Java-style `interface` syntax?
The project document specifies JavaScript/JSX. Standard JavaScript has no native interface or abstract-class declaration. This project uses an explicit runtime contract and abstract-base-class pattern. TypeScript would be required for compile-time `interface` declarations.
