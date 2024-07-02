# Systems Core

> This is an ECS variant.

## Core

The core engine is only responsible for managing systems.

> In the core library, I want to include some basic systems for now, but can be expanded upon later.

## Systems

A system is the only primitive of the engine, and can be thought of as the 'logic' of the engine.

> The core engine does not have a concept of systems interacting with each other. This is handled by the systems themselves.

### Basic Usage

```ts
// Create a system
class Example extends System {
	constructor() {
		super();
		// Initialize the system
	}

	run() {
		// Update the system
	}
}

// Add the system to the core
const core = new Core();
core.add(new Example(core));
```

#### Adapter Systems

An intermediary system that allows two systems to interact with each other.

```ts
class ExampleAdapter extends System {
	// The system to adapt
	adapter: System = new Example(core);

	run() {}
}

// use the adapter system instead of the Example system
const core = new Core();
core.add(new ExampleAdapter(core));
core.add(new Example(new ExampleAdapter(core)));
```

Now if whenever other Systems need to interact with the `Example` system, they can interact with the `ExampleAdapter` system instead, and if we ever need to change the `Example` system, we can do so without changing the other systems.

Adapters help stabilize the system APIs.

---

### Components & Entities

> Components & Entities in this model are handled by a system, so the core itself does not have a concept of components.

You can keep components in a systems directory or as a sibling to the systems directory.

#### Resources

Resources or `components` are data that is shared between systems.

However in this model, resources should be handled by the systems themselves.

---
