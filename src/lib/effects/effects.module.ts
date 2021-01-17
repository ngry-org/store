import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { EffectsProvider } from './effects-provider';
import { EffectsRegistry } from './effects.registry';

export const EFFECTS = new InjectionToken('EFFECTS');

@NgModule()
export class EffectsModule {

  static forFeature(effects: Array<Type<EffectsProvider>>): ModuleWithProviders<EffectsModule> {
    return {
      ngModule: EffectsModule,
      providers: [
        ...effects,
        {
          provide: EFFECTS,
          useValue: effects,
        },
      ],
    };
  }

  constructor(
    @Inject(EFFECTS) providers: Array<Type<EffectsProvider>>,
    registry: EffectsRegistry,
    injector: Injector,
  ) {
    for (const provider of providers) {
      registry.register(injector.get(provider));
    }
  }
}
