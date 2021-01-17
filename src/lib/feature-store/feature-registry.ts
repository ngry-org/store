import { Injectable, Type } from '@angular/core';
import { Actions } from '../action/actions';
import { FeatureStore } from './feature-store';

@Injectable({
  providedIn: 'root',
})
export class FeatureRegistry {
  private readonly features = new Map<Type<object>, FeatureStore>();

  constructor(
    private actions: Actions,
  ) {
  }

  select<TState extends object = object>(type: Type<TState>): FeatureStore<TState> {
    const feature = this.features.get(type);

    if (!feature) {
      throw new Error(`Feature with state ${type.name} is not registered`);
    }

    return feature as unknown as FeatureStore<TState>;
  }

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
