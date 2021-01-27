import { Observable } from 'rxjs';
import { Injectable, Type } from '@angular/core';
import { IAction } from '../action/action.interface';
import { Actions } from '../action/actions';
import { StateRegistry } from '../state/state-registry';

/**
 * Represents global store. In a nutshell it's an aggregate of states stores.
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
   * @param states Registry of states stores
   */
  constructor(
    private actions: Actions,
    private states: StateRegistry,
  ) {
  }

  /**
   * Selects stream of state by state type.
   * @param type Type of state
   * @since 1.0.0
   */
  select<TState extends object>(type: Type<TState>): Observable<TState> {
    return this.states.select(type).state;
  }

  /**
   * Dispatches an action to trigger state update in states stores.
   * @param action Instance of action
   * @since 1.0.0
   */
  dispatch(action: IAction): void {
    this.actions.next(action);
  }
}
