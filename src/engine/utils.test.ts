import { test, describe, expect } from 'bun:test';
import { DependencyGraph } from './utils';
import { System } from './core';

describe('DependencyGraph', () => {
	class TestSystem extends System {
		constructor() {
			super(null as any); // Mocking ECS reference
		}
		update(_: number): void {}
	}

	test('Add system', () => {
		const graph = new DependencyGraph();
		const system = new TestSystem();

		graph.addSystem(system);
		expect(graph.getSystems()).toEqual([system]);
	});

	test('Add dependency', () => {
		const graph = new DependencyGraph();
		const systemA = new TestSystem();
		const systemB = new TestSystem();

		graph.addSystem(systemA);
		graph.addSystem(systemB);
		graph.addDependency(systemA, systemB);

		expect(graph.getDependencies(systemA)).toEqual([systemB]);
	});

	test('Throws error when adding dependency for non-existent system', () => {
		const graph = new DependencyGraph();
		const systemA = new TestSystem();
		const systemB = new TestSystem();

		graph.addSystem(systemA);

		expect(() => {
			graph.addDependency(systemA, systemB);
		}).toThrow('System or dependency not found in graph');
	});

	test('Get systems', () => {
		const graph = new DependencyGraph();
		const systemA = new TestSystem();
		const systemB = new TestSystem();

		graph.addSystem(systemA);
		graph.addSystem(systemB);

		expect(graph.getSystems()).toEqual([systemA, systemB]);
	});

	test('Has cycle', () => {
		const graph = new DependencyGraph();
		const systemA = new TestSystem();
		const systemB = new TestSystem();

		graph.addSystem(systemA);
		graph.addSystem(systemB);
		graph.addDependency(systemA, systemB);
		graph.addDependency(systemB, systemA);

		expect(graph.hasCycle()).toBe(true);
	});

	test('No cycle', () => {
		const graph = new DependencyGraph();
		const systemA = new TestSystem();
		const systemB = new TestSystem();

		graph.addSystem(systemA);
		graph.addSystem(systemB);
		graph.addDependency(systemA, systemB);

		expect(graph.hasCycle()).toBe(false);
	});

	test('Topological sort', () => {
		const graph = new DependencyGraph();
		const systemA = new TestSystem();
		const systemB = new TestSystem();
		const systemC = new TestSystem();

		graph.addSystem(systemA);
		graph.addSystem(systemB);
		graph.addSystem(systemC);
		graph.addDependency(systemA, systemB);
		graph.addDependency(systemB, systemC);

		expect(graph.topologicalSort()).toEqual([systemA, systemB, systemC]);
	});

	test('Throws error on cycle detection during topological sort', () => {
		const graph = new DependencyGraph();
		const systemA = new TestSystem();
		const systemB = new TestSystem();

		graph.addSystem(systemA);
		graph.addSystem(systemB);
		graph.addDependency(systemA, systemB);
		graph.addDependency(systemB, systemA);

		expect(() => {
			graph.topologicalSort();
		}).toThrow('Cycle detected in dependency graph');
	});

	test('Mark dirty', () => {
		const graph = new DependencyGraph();
		const systemA = new TestSystem();

		graph.addSystem(systemA);
		expect(graph.getDirty()).toBe(true);

		graph.topologicalSort();
		expect(graph.getDirty()).toBe(false);
	});
});
