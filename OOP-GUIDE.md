# OOP implementation guide

This version applies OOP to the Root Finding part of the Numerical Methods website.

## Files changed
- `index.html`: loads math.js, graph.js, root-methods.js, then app.js in dependency order.
- `js/root-methods.js`: contains the OOP classes and four root-finding algorithms.
- `js/app.js`: selects a method object and calls its `calculate()` method.

## OOP concepts
1. **Encapsulation**: `NumericalMethod` stores its name in the private field `#name` and exposes it through a getter.
2. **Abstract class (simulated)**: `NumericalMethod` cannot be instantiated directly and its `calculate()` method throws until overridden. JavaScript has no native `abstract class` keyword.
3. **Inheritance**: `RootFindingMethod` extends `NumericalMethod`; `BisectionMethod`, `FalsePositionMethod`, `NewtonMethod`, and `SecantMethod` extend `RootFindingMethod`.
4. **Polymorphism**: all four child classes override `calculate()`. The UI calls `selectedMethod.calculate(...)` without implementing each algorithm inside the UI.
5. **Interface (simulated contract)**: `NumericalMethodContract.validate()` checks that an object has a `name` property and a `calculate()` method. JavaScript has no native `interface` keyword. For a real compile-time interface, migrate these classes to TypeScript.

## Current scope
The OOP integration currently implements the Root Finding category only. The other category options remain visible but are disabled/not yet connected, so existing unimplemented categories are not presented as working features.

## Run
Open `index.html` using a local web server (recommended) or a browser that allows the CDN dependency. The math.js script must load before `root-methods.js` and `app.js`.
