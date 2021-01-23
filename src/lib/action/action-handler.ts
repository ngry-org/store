import { Type } from '@angular/core';
import { IAction } from './action.interface';

/**
 * Represents an action handler method on specific state.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export class ActionHandler<TState extends object = object, TAction extends IAction = IAction> {

  /**
   * Initializes new instance.
   * @param action Type of action
   * @param handler Key of action handler method
   */
  constructor(
    private action: Type<TAction>,
    private handler: keyof TState,
  ) {
  }

  /**
   * Determines whether an action can be handled by this action handler.
   * @param action Instance of action
   * @since 1.0.0
   */
  handles(action: IAction): action is TAction {
    return action instanceof this.action;
  }

  /**
   * Invokes action handler method on state instance with action as parameter.
   * Handler method MUST either produce new instance of state or return the original one.
   * @param state Instance of state
   * @param action Instance of action
   * @since 1.0.0
   */
  invoke(state: TState, action: TAction): TState {
    return (state[this.handler] as any)(action);
  }
}
