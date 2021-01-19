import { Injectable } from '@angular/core';
import { Actions } from '../action/actions';
import { EffectsProvider } from './effects-provider';

@Injectable({
  providedIn: 'root',
})
export class EffectsRegistry {
  private readonly providers = new Set<EffectsProvider>();

  constructor(
    private actions: Actions,
  ) {
  }

  register(provider: EffectsProvider): void {
    if (this.providers.has(provider)) {
      throw new Error(`Effects provider ${provider.constructor.name} already registered`);
    }

    this.providers.add(provider);

    for (const effect of provider.effects) {
      effect.subscribe(action => {
        Promise.resolve().then(() => this.actions.next(action));
      });
    }
  }
}
