# Systems Engine

> This is an ECS variant. It is designed to be simple and easy to use, while still being powerful and flexible.

## The Core

The core engine is only responsible for managing systems.

_Entities and components are abstracted into a system. By keeping these abstracted, the different systems can be easily swapped out or modified._

### Systems

A system is the only primitive of the engine, and can be thought of as the 'logic' of the engine.

> When systems need to interact with each other, you can either use intermediary systems, or use nested systems. The core engine does not have a concept of systems interacting with each other.

#### Adapters

An intermediary system that allows two systems to interact with each other. This is useful when you want to keep systems decoupled from each other.

#### Nested Systems

A system that contains other systems. This is useful when you want to keep systems together that need to interact with each other.

---

### Components & Entities

> Components & Entities in this model are handled by a system, so the core itself does not have a concept of components.
