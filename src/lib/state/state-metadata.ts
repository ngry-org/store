import 'reflect-metadata';
import { Type } from '@angular/core';
import { ActionHandler } from '../action/action-handler';

const STATE_METADATA = Symbol();

/**
 * Represents container for metadata of the state class.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export class StateMetadata<TState extends object = object> {

  /**
   * Resolves metadata of state class.
   * @param type Type of state
   * @since 1.0.0
   */
  static of<TState extends object = object>(type: Type<TState>): StateMetadata<TState> {
    let metadata: StateMetadata<TState> | undefined = Reflect.getMetadata(STATE_METADATA, type);

    if (!metadata) {
      metadata = new StateMetadata<TState>();
      Reflect.defineMetadata(STATE_METADATA, metadata, type);
    }

    return metadata;
  }

  /**
   * Gets list of action handlers.
   * @since 1.0.0
   */
  readonly handlers: Array<ActionHandler<TState>> = [];
}
