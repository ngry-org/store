import { Observable } from 'rxjs';
import { IAction } from '../action/action.interface';

/**
 * Represents provider of effects.
 * In a nutshell, it's just a collection of actions streams, each of them can be bridged to actions consumers.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export abstract class EffectsProvider {
  /**
   * Gets collection of actions streams.
   * @since 1.0.0
   */
  readonly effects: Iterable<Observable<IAction>>;

  /**
   * Initializes an effects provider.
   * @param effects Collection of action streams.
   * @since 1.0.0
   * @protected
   */
  protected constructor(
    effects: Iterable<Observable<IAction>>,
  ) {
    this.effects = effects;
  }
}
