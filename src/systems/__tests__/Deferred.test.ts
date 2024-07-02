import { describe, expect, test, spyOn } from 'bun:test';
import { Core } from '../../core';
import { Component, EntityAdapter } from '../EntityAdapter';
import { SystemsAdapter } from '../SystemsAdapter';
import { Deferred } from '../Deferred';

describe('Deferred', () => {
	const core = new Core();
	const em = core.add(new EntityAdapter());
	const sm = core.add(new SystemsAdapter(core));

	const deferredSystem = new Deferred(em);

	test('Can add system to core', () => {
		sm.addSystem(deferredSystem);
		const [system] = core.get(Deferred);
		expect(system).toBe(deferredSystem);
	});

	test('should defer the creation of an entity', () => {
		const createEntitySpy = spyOn(em, 'create');
		deferredSystem.deferCreate();
		expect(createEntitySpy).not.toHaveBeenCalled();
		sm.run(0);
		expect(createEntitySpy).toHaveBeenCalled();
	});

	test('should defer the destruction of an entity', () => {
		const destroyEntitySpy = spyOn(em, 'destroy');
		const mockEntity = 1;
		deferredSystem.deferDestroy(mockEntity);
		expect(destroyEntitySpy).not.toHaveBeenCalled();
		sm.run(0);
		expect(destroyEntitySpy).toHaveBeenCalledWith(mockEntity);
	});

	test('should defer adding a component to an entity', () => {
		const spy = spyOn(em, 'add');
		const mockEntity = 1;
		const mockComponent: Component = {};
		deferredSystem.deferAdd(mockEntity, mockComponent);
		expect(spy).not.toHaveBeenCalled();
		sm.run(0);
		expect(spy).toHaveBeenCalledWith(mockEntity, mockComponent);
	});

	test('should defer removing a component from an entity', () => {
		const spy = spyOn(em, 'remove');
		const mockEntity = 1;
		const mockComponent: Component = {};
		deferredSystem.deferRemove(mockEntity, mockComponent);
		expect(spy).not.toHaveBeenCalled();
		sm.run(0);
		expect(spy).toHaveBeenCalledWith(mockEntity, mockComponent);
	});

	test('should clear deferred queue on run', () => {
		const createEntitySpy = spyOn(em, 'create');
		const destroyEntitySpy = spyOn(em, 'destroy');
		const addComponentSpy = spyOn(em, 'add');
		const removeComponentSpy = spyOn(em, 'remove');

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
