import { describe, expect, test, spyOn } from 'bun:test';
import { Deferred, EntityManager } from '.';
import { Component, Core } from '../core';

describe('Deferred', () => {
	const core = new Core();
	const em = new EntityManager(core);

	const deferredSystem = new Deferred(core, em);

	test('Can add system to core', () => {
		core.addSystem(deferredSystem);
		const system = core.getSystem(Deferred);
		expect(system).toBe(deferredSystem);
	});

	test('should defer the creation of an entity', () => {
		const createEntitySpy = spyOn(em, 'createEntity');
		deferredSystem.deferCreate();
		expect(createEntitySpy).not.toHaveBeenCalled();
		core.update(0);
		expect(createEntitySpy).toHaveBeenCalled();
	});

	test('should defer the destruction of an entity', () => {
		const destroyEntitySpy = spyOn(em, 'destroyEntity');
		const mockEntity = 1;
		deferredSystem.deferDestroy(mockEntity);
		expect(destroyEntitySpy).not.toHaveBeenCalled();
		core.update(0);
		expect(destroyEntitySpy).toHaveBeenCalledWith(mockEntity);
	});

	test('should defer adding a component to an entity', () => {
		const spy = spyOn(em, 'addComponent');
		const mockEntity = 1;
		const mockComponent: Component = {};
		deferredSystem.deferAdd(mockEntity, mockComponent);
		expect(spy).not.toHaveBeenCalled();
		core.update(0);
		expect(spy).toHaveBeenCalledWith(mockEntity, mockComponent);
	});

	test('should defer removing a component from an entity', () => {
		const spy = spyOn(em, 'removeComponent');
		const mockEntity = 1;
		const mockComponent: Component = {};
		deferredSystem.deferRemove(mockEntity, mockComponent);
		expect(spy).not.toHaveBeenCalled();
		core.update(0);
		expect(spy).toHaveBeenCalledWith(mockEntity, mockComponent);
	});

	test('should execute deferred operations at the end of the frame', () => {
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

		core.update(0);

		expect(createEntitySpy).toHaveBeenCalledTimes(2);
		expect(destroyEntitySpy).toHaveBeenCalledTimes(2);
		expect(addComponentSpy).toHaveBeenCalledTimes(2);
		expect(removeComponentSpy).toHaveBeenCalledTimes(2);
	});
});
