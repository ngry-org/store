import { Observable } from 'rxjs';
import { IAction } from '../action/action.interface';

export abstract class EffectsProvider {

  protected constructor(
    readonly effects: Iterable<Observable<IAction>>,
  ) {
  }
}
