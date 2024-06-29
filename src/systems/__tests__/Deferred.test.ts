import { describe, expect, test, spyOn } from 'bun:test';
import { Core } from '../../core';
import { Component, EntityManager } from '../EntityManager';
import { SystemGraph } from '../SystemGraph';
import { Deferred } from '../Deferred';

describe('Deferred', () => {
	const core = new Core();
	const em = core.add(new EntityManager(core));
	const sm = core.add(new SystemGraph(core));

	const deferredSystem = new Deferred(core, em);

	test('Can add system to core', () => {
		sm.addSystem(deferredSystem);
		const [system] = core.get(Deferred);
		expect(system).toBe(deferredSystem);
	});

	test('should defer the creation of an entity', () => {
		const createEntitySpy = spyOn(em, 'createEntity');
		deferredSystem.deferCreate();
		expect(createEntitySpy).not.toHaveBeenCalled();
		sm.run(0);
		expect(createEntitySpy).toHaveBeenCalled();
	});

	test('should defer the destruction of an entity', () => {
		const destroyEntitySpy = spyOn(em, 'destroyEntity');
		const mockEntity = 1;
		deferredSystem.deferDestroy(mockEntity);
		expect(destroyEntitySpy).not.toHaveBeenCalled();
		sm.run(0);
		expect(destroyEntitySpy).toHaveBeenCalledWith(mockEntity);
	});

	test('should defer adding a component to an entity', () => {
		const spy = spyOn(em, 'addComponent');
		const mockEntity = 1;
		const mockComponent: Component = {};
		deferredSystem.deferAdd(mockEntity, mockComponent);
		expect(spy).not.toHaveBeenCalled();
		sm.run(0);
		expect(spy).toHaveBeenCalledWith(mockEntity, mockComponent);
	});

	test('should defer removing a component from an entity', () => {
		const spy = spyOn(em, 'removeComponent');
		const mockEntity = 1;
		const mockComponent: Component = {};
		deferredSystem.deferRemove(mockEntity, mockComponent);
		expect(spy).not.toHaveBeenCalled();
		sm.run(0);
		expect(spy).toHaveBeenCalledWith(mockEntity, mockComponent);
	});

	test('should clear deferred queue on run', () => {
		const createEntitySpy = spyOn(em, 'createEntity');
		const destroyEntitySpy = spyOn(em, 'destroyEntity');
		const addComponentSpy = spyOn(em, 'addComponent');
		const removeComponentSpy = spyOn(em, 'removeComponent');

		const mockEntity = 1;
		const mockComponent: Component = {};

		deferredSystem.deferCreate();
		deferredSystem.deferDestroy(mockEntity);
		deferredSystem.deferAdd(mockEntity, mockComponent);
		deferredSystem.deferRemove(mockEntity, mockComponent);

		expect(createEntitySpy).toHaveBeenCalledTimes(1);
		expect(destroyEntitySpy).toHaveBeenCalledTimes(1);
		expect(addComponentSpy).toHaveBeenCalledTimes(1);
		expect(removeComponentSpy).toHaveBeenCalledTimes(1);

		sm.run(0);

		expect(createEntitySpy).toHaveBeenCalledTimes(2);
		expect(destroyEntitySpy).toHaveBeenCalledTimes(2);
		expect(addComponentSpy).toHaveBeenCalledTimes(2);
		expect(removeComponentSpy).toHaveBeenCalledTimes(2);
	});
});
