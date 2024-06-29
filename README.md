# Systems Core

> This is an ECS variant.

## Core

The core engine is only responsible for managing systems.

> In the core library, I want to include some basic systems for now, but can be expanded upon later.

## Systems

A system is the only primitive of the engine, and can be thought of as the 'logic' of the engine.

> The core engine does not have a concept of systems interacting with each other. This is handled by the systems themselves.

#### Resources

Resources or `components` are data that is shared between systems.

However in this model, resources should be handled by the systems themselves.

### Basic Usage

```ts
// Create a system
class Example extends System {
	constructor(core: Core) {
		super(core);
		// Initialize the system
	}

	update() {
		// Update the system
	}
}

// Add the system to the core
const core = new Core();
core.add(new Example(core));
```

#### Adapter Systems (Contracts)

An intermediary system that allows two systems to interact with each other. This is useful when you want to keep systems decoupled from each other.

#### Composite Systems

A system that contains other systems. This is useful when you want to keep systems together that need to interact with each other.

---

### Components & Entities

> Components & Entities in this model are handled by a system, so the core itself does not have a concept of components.

---

## Usage

1. Define a system
