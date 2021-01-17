import { Observable } from 'rxjs';
import { Injectable, Type } from '@angular/core';
import { IAction } from '../action/action.interface';
import { Actions } from '../action/actions';
import { FeatureRegistry } from '../feature-store/feature-registry';

@Injectable({
  providedIn: 'root',
})
export class Store {
  constructor(
    private actions: Actions,
    private features: FeatureRegistry,
  ) {
  }

  select<TState extends object>(type: Type<TState>): Observable<TState> {
    return this.features.select(type).state;
  }

  dispatch(action: IAction): void {
    this.actions.next(action);
  }
}
