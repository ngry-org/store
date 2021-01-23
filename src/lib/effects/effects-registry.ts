import { Injectable } from '@angular/core';
import { Actions } from '../action/actions';
import { EffectsProvider } from './effects-provider';

/**
 * Represents an effects registry.
 * @since 1.0.0
 * @author Alex Chugaev
 */
@Injectable({
  providedIn: 'root',
})
export class EffectsRegistry {
  private readonly providers = new Set<EffectsProvider>();

  /**
   * Initializes new instance
   * @param actions Stream of actions
   */
  constructor(
    private readonly actions: Actions,
  ) {
  }

  /**
   * Registers effects provider.
   * @param provider Instance of effects provider
   * @since 1.0.0
   * @throws When such effects provider already registered
   */
  register(provider: EffectsProvider): void {
    if (this.providers.has(provider)) {
      throw new Error(`Effects provider ${provider.constructor.name} already registered`);
    }

    this.providers.add(provider);

    provider.bridgeTo(this.actions);
  }
}
