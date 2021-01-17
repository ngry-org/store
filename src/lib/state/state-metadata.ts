import 'reflect-metadata';
import { Type } from '@angular/core';
import { ActionHandler } from '../action/action-handler';

const STATE_METADATA = Symbol();

export class StateMetadata<TState extends object = object> {
  static of<TState extends object = object>(type: Type<TState>): StateMetadata<TState> {
    let metadata: StateMetadata<TState> | undefined = Reflect.getMetadata(STATE_METADATA, type);

    if (!metadata) {
      metadata = new StateMetadata<TState>();
      Reflect.defineMetadata(STATE_METADATA, metadata, type);
    }

    return metadata;
  }

  readonly handlers: Array<ActionHandler<TState>> = [];
}
