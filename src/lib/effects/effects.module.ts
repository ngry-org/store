import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { EffectsProvider } from './effects-provider';
import { EffectsRegistry } from './effects-registry';

export const EFFECTS_PROVIDERS = new InjectionToken<Array<Type<EffectsProvider>>>('Effects providers');

/**
 * Represents effects module which registers effects provides.
 * @since 1.0.0
 * @author Alex Chugaev
 */
@NgModule()
export class EffectsModule {

  /**
   * Produces dynamic feature-module with provided effects providers.
   * @param providers List of effects providers.
   * @since 1.0.0
   */
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

  /**
   * Initializes new instance.
   * @param providers List of effects providers
   * @param registry Effects registry
   * @param injector Injector
   */
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
