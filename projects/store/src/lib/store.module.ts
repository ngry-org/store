import { Type } from '@monument/core';
import { Actions, EffectMediator, ErrorMediator, Errors, Store } from '@monument/store';
import { Inject, InjectFlags, InjectionToken, Injector, ModuleWithProviders, NgModule } from '@angular/core';

export interface FeatureConfiguration {
  readonly store?: Type<Store<any, any>>;
  readonly effects?: Array<Type<object>>;
  readonly errorHandlers?: Array<Type<object>>;
}

const FEATURE_CONFIGURATION: InjectionToken<FeatureConfiguration> = new InjectionToken('FEATURE_CONFIGURATION');

@NgModule({})
export class StoreModule {
  static forRoot(feature: FeatureConfiguration = {}): ModuleWithProviders<StoreModule> {
    return {
      ngModule: StoreModule,
      providers: [
        {
          provide: Actions,
          useFactory() {
            return new Actions();
          }
        },
        {
          provide: Errors,
          useFactory() {
            return new Errors();
          }
        },
        {
          provide: FEATURE_CONFIGURATION,
          useValue: feature
        },
        ...(feature.store ? [feature.store] : []),
        ...(feature.effects || []),
        ...(feature.errorHandlers || [])
      ]
    };
  }

  static forFeature(feature: FeatureConfiguration): ModuleWithProviders<StoreModule> {
    return {
      ngModule: StoreModule,
      providers: [
        {
          provide: FEATURE_CONFIGURATION,
          useValue: feature
        },
        ...(feature.store ? [feature.store] : []),
        ...(feature.effects || []),
        ...(feature.errorHandlers || [])
      ]
    };
  }

  private effectMediator: EffectMediator;
  private errorMediator: ErrorMediator;

  constructor(injector: Injector) {
    const actions: Actions = injector.get(Actions);
    const errors: Errors = injector.get(Errors);

    const feature = injector.get(FEATURE_CONFIGURATION);

    if (feature.store) {
      try {
        injector.get(feature.store);
      } catch {
      }
    }

    const effects: Array<object> = (feature.effects || []).map(ctor => injector.get(ctor));
    const errorHandlers: Array<object> = (feature.errorHandlers || []).map(ctor => injector.get(ctor));

    this.effectMediator = new EffectMediator(actions, effects);
    this.errorMediator = new ErrorMediator(errors, errorHandlers);
  }
}
