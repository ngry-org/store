import { Inject, InjectableProvider, InjectionToken, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { FeatureRegistry } from '../feature-store/feature-registry';

/**
 * Injection token for features states.
 * @internal
 * @since 4.0.0
 * @author Alex Chugaev
 */
export const FEATURES_STATES = new InjectionToken<object>('Features states');

/**
 * Represents store module which registers {@link FeatureStore}s for every state provider.
 * @since 1.0.0
 * @author Alex Chugaev
 */
@NgModule()
export class StoreModule {

  /**
   * Registers {@link FeatureStore}s for every state provider.
   * @param providers List of state providers
   * @since 1.0.0
   */
  static forFeature(providers: Array<InjectableProvider>): ModuleWithProviders<StoreModule> {
    return {
      ngModule: StoreModule,
      providers: providers.map(provider => {
        return {
          provide: FEATURES_STATES,
          multi: true,
          ...provider,
        } as Provider;
      }),
    };
  }

  /**
   * Initializes new instance.
   * @param states List of states instances.
   * @param registry Features registry
   */
  constructor(
    @Inject(FEATURES_STATES) states: Array<object>,
    registry: FeatureRegistry,
  ) {
    for (const state of states) {
      registry.register(state);
    }
  }
}
