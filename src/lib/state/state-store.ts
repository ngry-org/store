import { Type } from '@angular/core';
import { IAction } from '../action/action.interface';
import { ActionHandler } from '../action/action-handler';
import { StateMetadata } from './state-metadata';
import { StoreBase } from '../store/store-base';

/**
 * Represents store which maintains the lifecycle of state.
 * @since 5.0.0
 * @author Alex Chugaev
 */
export class StateStore<TState extends object = object, TAction extends IAction = IAction> extends StoreBase<TState> {
  private readonly handlers: Array<ActionHandler<TState>>;

  /**
   * Initializes new instance.
   * @param state Initial state
   */
  constructor(state: TState) {
    super(state);

    const metadata = StateMetadata.of(state.constructor as Type<TState>);

    this.handlers = metadata.handlers;
  }

  /**
   * Dispatches an action to trigger state update.
   * @param action Instance of action
   * @since 5.0.0
   */
  dispatch(action: TAction): void {
    for (const handler of this.handlers) {
      if (handler.handles(action)) {
        const oldState = this.snapshot;
        const newState = handler.invoke(oldState, action);

        if (newState !== oldState) {
          this.next(newState);
        }
      }
    }
  }
}
