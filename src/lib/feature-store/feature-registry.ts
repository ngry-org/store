import { Injectable, Type } from '@angular/core';
import { Actions } from '../action/actions';
import { FeatureStore } from './feature-store';

/**
 * Represents feature registry which registers feature stores as consumers of actions.
 * @since 1.0.0
 * @author Alex Chugaev
 */
@Injectable({
  providedIn: 'root',
})
export class FeatureRegistry {
  private readonly features = new Map<Type<object>, FeatureStore>();

  /**
   * Initializes new instance.
   * @param actions Stream of actions
   */
  constructor(
    private readonly actions: Actions,
  ) {
  }

  /**
   * Selects feature store by its state type.
   * @param type Type of state
   * @since 1.0.0
   * @throws When feature store with state of given type is not registered
   */
  select<TState extends object = object>(type: Type<TState>): FeatureStore<TState> | never {
    const feature = this.features.get(type);

    if (!feature) {
      throw new Error(`Feature with state ${type.name} is not registered`);
    }

    return feature as unknown as FeatureStore<TState>;
  }

  /**
   * Registers new feature store initialized by given state.
   * @param state Initial state
   * @since 1.0.0
   * @throws When feature store with state of given type is already registered
   */
  register<TState extends object = object>(state: TState): void {
    if (this.features.has(state.constructor as Type<TState>)) {
      throw new Error(`Feature with state ${state.constructor.name} already registered`);
    }

    const feature = new FeatureStore(state);

    this.features.set(state.constructor as Type<TState>, feature as unknown as FeatureStore);

    this.actions.subscribe(action => {
      feature.dispatch(action);
    });
  }
}
