import { Type } from '@monument/core';
import { Actions, EffectMediator, ErrorMediator, Errors, Store } from '@monument/store';
import { Inject, InjectionToken, ModuleWithProviders, NgModule, Optional, Provider } from '@angular/core';

const STORE: InjectionToken<Store<any, any>> = new InjectionToken('STORE');
const EFFECTS: InjectionToken<Array<object>> = new InjectionToken('EFFECTS');
const ERROR_HANDLERS: InjectionToken<Array<object>> = new InjectionToken('ERROR_HANDLERS');

export interface StoreModuleConfiguration {
  readonly store?: Type<Store<any, any>>;
  readonly effects?: Array<Type<object>>;
  readonly errorHandlers?: Array<Type<object>>;
}

export function ConvertEffectsToProviders(providers: Provider[], effects: Array<Type<object>> = []) {
  for (const effect of effects) {
    providers.push({
      provide: EFFECTS,
      useClass: effect,
      multi: true
    });
  }
}

export function ConvertErrorHandlersToProviders(providers: Provider[], errorHandlers: Array<Type<object>> = []) {
  for (const errorHandler of errorHandlers) {
    providers.push({
      provide: ERROR_HANDLERS,
      useClass: errorHandler,
      multi: true
    });
  }
}

@NgModule({
  providers: [
    {
      provide: Actions,
      useFactory(): Actions {
        return new Actions();
      }
    },
    {
      provide: Errors,
      useFactory(): Errors {
        return new Errors();
      }
    }
  ]
})
export class StoreRootModule {
}

@NgModule()
export class StoreFeatureModule {
  private effectMediator: EffectMediator;
  private errorMediator: ErrorMediator;

  constructor(
    actions: Actions,
    errors: Errors,
    @Optional() @Inject(STORE) store: Store<any, any> | null,
    @Optional() @Inject(EFFECTS) effects: Array<object> | null,
    @Optional() @Inject(ERROR_HANDLERS) errorHandlers: Array<object> | null
  ) {
    this.effectMediator = new EffectMediator(actions, effects || []);
    this.errorMediator = new ErrorMediator(errors, errorHandlers || []);
  }
}

@NgModule()
export class StoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: StoreRootModule
    };
  }

  static forFeature(configuration: StoreModuleConfiguration): ModuleWithProviders {
    const providers: Provider[] = [];

    if (configuration.store) {
      providers.push(
        {
          provide: configuration.store,
          useClass: configuration.store
        },
        {
          provide: STORE,
          useExisting: configuration.store
        }
      );
    }

    ConvertEffectsToProviders(providers, configuration.effects);
    ConvertErrorHandlersToProviders(providers, configuration.errorHandlers);

    return {
      ngModule: StoreFeatureModule,
      providers
    };
  }
}
