import { Type } from '@angular/core';
import { IAction } from '../action/action.interface';
import { ActionHandler } from '../action/action-handler';
import { StateMetadata } from '../state/state-metadata';
import { StoreBase } from '../store/store-base';

export class FeatureStore<TState extends object = object, TAction extends IAction = IAction> extends StoreBase<TState> {
  private readonly handlers: Array<ActionHandler<TState>>;

  constructor(state: TState) {
    super(state);

    const metadata = StateMetadata.of(state.constructor as Type<TState>);
    this.handlers = metadata.handlers;
  }

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
