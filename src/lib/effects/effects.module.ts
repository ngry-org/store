import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { EffectsProvider } from './effects-provider';
import { EffectsRegistry } from './effects-registry';

export const EFFECTS_PROVIDERS = new InjectionToken<Array<Type<EffectsProvider>>>('Effects providers');

@NgModule()
export class EffectsModule {

  static forFeature(providers: Array<Type<EffectsProvider>>): ModuleWithProviders<EffectsModule> {
    return {
      ngModule: EffectsModule,
      providers: [
        {
          provide: EFFECTS_PROVIDERS,
          useFactory(): Array<Type<EffectsProvider>> {
            return providers;
          },
        },
      ],
    };
  }

  constructor(
    @Inject(EFFECTS_PROVIDERS) providers: Array<Type<EffectsProvider>>,
    registry: EffectsRegistry,
    injector: Injector,
  ) {
    for (const provider of providers) {
      registry.register(injector.get(provider));
    }
  }
}
