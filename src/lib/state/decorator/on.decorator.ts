import 'reflect-metadata';
import { Type } from '@angular/core';
import { IAction } from '../../action/action.interface';
import { ActionHandler } from '../../action/action-handler';
import { StateMetadata } from '../state-metadata';

/**
 * Marks method of state class as an action handler.
 * @param type Type of action
 * @since 1.0.0
 * @author Alex Chugaev
 */
export function On<TAction extends IAction>(type: Type<TAction>): MethodDecorator {
  return (target: object, propertyKey) => {
    const metadata: StateMetadata = StateMetadata.of(target.constructor as Type<object>);

    metadata.handlers.push(new ActionHandler(type, propertyKey as keyof object));
  };
}
