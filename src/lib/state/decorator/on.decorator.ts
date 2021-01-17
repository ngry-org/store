import 'reflect-metadata';
import { Type } from '@angular/core';
import { IAction } from '../../action/action.interface';
import { ActionHandler } from '../../action/action-handler';
import { StateMetadata } from '../state-metadata';

export function On<TAction extends IAction>(type: Type<TAction>): MethodDecorator {
  return (target: object, propertyKey) => {
    const metadata: StateMetadata = StateMetadata.of(target.constructor as Type<object>);

    metadata.handlers.push(new ActionHandler(type, propertyKey as keyof object));
  };
}
