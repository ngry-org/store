import { Observable } from 'rxjs';
import { Injectable, Type } from '@angular/core';
import { IAction } from '../action/action.interface';
import { Actions } from '../action/actions';
import { FeatureRegistry } from '../feature-store/feature-registry';

/**
 * Represents global store. In a nutshell it's an aggregate of feature stores.
 * @since 1.0.0
 * @author Alex Chugaev
 */
@Injectable({
  providedIn: 'root',
})
export class Store {

  /**
   * Initializes new instance.
   * @param actions Stream of actions
   * @param features Registry of features stores
   */
  constructor(
    private actions: Actions,
    private features: FeatureRegistry,
  ) {
  }

  /**
   * Selects stream of state by state type.
   * @param type Type of state
   * @since 1.0.0
   */
  select<TState extends object>(type: Type<TState>): Observable<TState> {
    return this.features.select(type).state;
  }

  /**
   * Dispatches an action to trigger state update in features stores.
   * @param action Instance of action
   * @since 1.0.0
   */
  dispatch(action: IAction): void {
    this.actions.next(action);
  }
}
