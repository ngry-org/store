import { Inject, InjectableProvider, InjectionToken, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { FeatureRegistry } from '../feature-store/feature-registry';

export const FEATURE_STATE = new InjectionToken<object>('Feature state');

@NgModule()
export class StoreModule {
  /**
   *
   * @param providers List of state providers
   */
  static forFeature(providers: Array<InjectableProvider>): ModuleWithProviders<StoreModule> {
    return {
      ngModule: StoreModule,
      providers: providers.map(provider => {
        return {
          provide: FEATURE_STATE,
          multi: true,
          ...provider,
        } as Provider;
      }),
    };
  }

  constructor(
    @Inject(FEATURE_STATE) states: Array<object>,
    registry: FeatureRegistry,
  ) {
    for (const state of states) {
      registry.register(state);
    }
  }
}
