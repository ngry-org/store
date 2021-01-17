import { Type } from '@angular/core';
import { IAction } from './action.interface';

export class ActionHandler<TState extends object = object, TAction extends IAction = IAction> {
  constructor(
    private action: Type<TAction>,
    private handler: keyof TState,
  ) {
  }

  handles(action: IAction): boolean {
    return action instanceof this.action;
  }

  invoke(self: TState, action: TAction): TState {
    return (self[this.handler] as any)(action);
  }
}
