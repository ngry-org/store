import { merge } from 'rxjs';
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
      throw new Error(`Effects ${provider.constructor.name} already registered`);
    }

    this.providers.add(provider);

    merge(...provider.effects).subscribe(action => {
      Promise.resolve().then(() => this.actions.next(action));
    });
  }
}
