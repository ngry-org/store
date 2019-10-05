import { Type } from '@monument/core';
import { Actions, EffectMediator, ErrorMediator, Errors, Store } from '@monument/store';
import { InjectFlags, InjectionToken, Injector, ModuleWithProviders, NgModule, Provider } from '@angular/core';

const STORE: InjectionToken<Store<any, any>> = new InjectionToken('STORE');
const EFFECTS: InjectionToken<Array<object>> = new InjectionToken('EFFECTS');
const ERROR_HANDLERS: InjectionToken<Array<object>> = new InjectionToken('ERROR_HANDLERS');

export interface FeatureConfiguration {
  readonly store?: Type<Store<any, any>>;
  readonly effects?: Array<Type<object>>;
  readonly errorHandlers?: Array<Type<object>>;
}

@NgModule()
export class StoreModule {
  static forRoot(feature: FeatureConfiguration = {}): ModuleWithProviders<StoreModule> {
    const featureProviders: Provider[] = getFeatureProviders(feature);

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
        ...featureProviders
      ]
    };
  }

  static forFeature(feature: FeatureConfiguration): ModuleWithProviders<StoreModule> {
    const featureProviders: Provider[] = getFeatureProviders(feature);

    return {
      ngModule: StoreModule,
      providers: featureProviders
    };
  }

  private effectMediator: EffectMediator;
  private errorMediator: ErrorMediator;

  constructor(
    injector: Injector
  ) {
    const actions: Actions = injector.get(Actions);
    const errors: Errors = injector.get(Errors);

    try {
      injector.get(STORE, undefined, InjectFlags.Optional);
    } catch {
    }

    const effects: Array<object> = injector.get(EFFECTS, [], InjectFlags.Optional);
    const errorHandlers: Array<object> = injector.get(ERROR_HANDLERS, [], InjectFlags.Optional);

    this.effectMediator = new EffectMediator(actions, effects);
    this.errorMediator = new ErrorMediator(errors, errorHandlers);
  }
}

export function getFeatureProviders({store, effects = [], errorHandlers = []}: FeatureConfiguration): Provider[] {
  const providers: Provider[] = [];

  if (store) {
    providers.push(store);
    providers.push({
      provide: STORE,
      useExisting: store,
      multi: true
    });
  }

  for (const ctor of effects) {
    providers.push(ctor);
    providers.push({
      provide: EFFECTS,
      useExisting: ctor,
      multi: true
    });
  }

  for (const ctor of errorHandlers) {
    providers.push(ctor);
    providers.push({
      provide: ERROR_HANDLERS,
      useExisting: ctor,
      multi: true
    });
  }

  return providers;
}
