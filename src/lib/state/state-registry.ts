import { Injectable, Type } from '@angular/core';
import { Actions } from '../action/actions';
import { StateStore } from './state-store';

/**
 * Represents state registry which registers state stores as consumers of actions.
 * @since 5.0.0
 * @author Alex Chugaev
 */
@Injectable({
  providedIn: 'root',
})
export class StateRegistry {
  private readonly stores = new Map<Type<object>, StateStore>();

  /**
   * Initializes new instance.
   * @param actions Stream of actions
   */
  constructor(
    private readonly actions: Actions,
  ) {
  }

  /**
   * Determines whether state of given type is already registered.
   * @param type Type of state
   * @since 5.0.0
   */
  has<TState extends object = object>(type: Type<TState>): boolean {
    return this.stores.has(type);
  }

  /**
   * Selects state store by state type.
   * @param type Type of state
   * @since 5.0.0
   * @throws When state store with state of given type is not registered
   */
  select<TState extends object = object>(type: Type<TState>): StateStore<TState> | never {
    const store = this.stores.get(type);

    if (!store) {
      throw new Error(`State of type ${type.name} is not registered`);
    }

    return store as unknown as StateStore<TState>;
  }

  /**
   * Registers new state store initialized by given state.
   * @param state Initial state
   * @since 5.0.0
   * @throws When state store with state of given type is already registered
   */
  register<TState extends object = object>(state: TState): void {
    if (this.stores.has(state.constructor as Type<TState>)) {
      throw new Error(`State of type ${state.constructor.name} already registered`);
    }

    const store = new StateStore(state);

    this.stores.set(state.constructor as Type<TState>, store as unknown as StateStore);

    this.actions.subscribe(action => {
      store.dispatch(action);
    });
  }
}
