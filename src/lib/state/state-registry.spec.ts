import { TestBed } from '@angular/core/testing';
import { StateRegistry } from './state-registry';
import { StateStore } from './state-store';

class CheckboxState {
  constructor(
    readonly checked = false,
  ) {
  }
}

class RadioState {
  constructor(
    readonly checked = false,
  ) {
  }
}

describe('StateRegistry', () => {
  let registry: StateRegistry;
  let state: CheckboxState;

  beforeEach(() => {
    registry = TestBed.inject(StateRegistry);
    state = new CheckboxState();

    registry.register(state);
  });

  describe('has', () => {
    it('should determine whether registry contains state of given type', () => {
      expect(registry.has(CheckboxState)).toBe(true);
      expect(registry.has(RadioState)).toBe(false);
    });
  });

  describe('register', () => {
    it('should register store for new state', () => {
      expect(registry.select(CheckboxState)).toBeInstanceOf(StateStore);
      expect(registry.select(CheckboxState).snapshot).toBe(state);
    });

    it('should throw when attempting to register the same state multiple times', () => {
      expect(() => registry.register(state)).toThrow(`State of type ${state.constructor.name} already registered`);
    });

    it('should throw when attempting to register state of the same type multiple times', () => {
      const state2 = new CheckboxState();

      expect(() => registry.register(state2)).toThrow(`State of type ${state2.constructor.name} already registered`);
    });
  });

  describe('select', () => {
    it('should return instance of StateStore of state of given type', () => {
      expect(registry.select(CheckboxState)).toBeInstanceOf(StateStore);
      expect(registry.select(CheckboxState).snapshot).toBe(state);
    });

    it('should throw when state of such type is not registered', () => {
      expect(() => registry.select(RadioState)).toThrow(`State of type ${RadioState.name} is not registered`);
    });
  });
});
