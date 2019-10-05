import { Type } from '@monument/core';
import { Actions, EffectMediator, ErrorMediator, Errors, Store } from '@monument/store';
import { Inject, InjectionToken, ModuleWithProviders, NgModule, Optional, Provider } from '@angular/core';
import { GlobalActions } from './global.actions';
import { GlobalErrors } from './global.errors';

const STORE: InjectionToken<Store<any, any>> = new InjectionToken('STORE');
const EFFECTS: InjectionToken<Array<object>> = new InjectionToken('EFFECTS');
const ERROR_HANDLERS: InjectionToken<Array<object>> = new InjectionToken('ERROR_HANDLERS');

export interface StoreModuleConfiguration {
  readonly store?: Type<Store<any, any>>;
  readonly effects?: Array<Type<object>>;
  readonly errorHandlers?: Array<Type<object>>;
}

@NgModule({
  providers: [
    GlobalActions,
    GlobalErrors,
    {
      provide: Actions,
      useExisting: GlobalActions
    },
    {
      provide: Errors,
      useExisting: GlobalErrors
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
    actions: GlobalActions,
    errors: GlobalErrors,
    @Optional() @Inject(STORE) store: Store<any, any> | null,
    @Optional() @Inject(EFFECTS) effects: Array<object> | null,
    @Optional() @Inject(ERROR_HANDLERS) errorHandlers: Array<object> | null
  ) {
    this.effectMediator = new EffectMediator(actions, effects || []);
    this.errorMediator = new ErrorMediator(errors, errorHandlers || []);
  }
}

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

    if (configuration.effects) {
      for (const effect of configuration.effects) {
        providers.push({
          provide: EFFECTS,
          useClass: effect,
          multi: true
        });
      }
    }

    if (configuration.errorHandlers) {
      for (const errorHandler of configuration.errorHandlers) {
        providers.push({
          provide: ERROR_HANDLERS,
          useClass: errorHandler,
          multi: true
        });
      }
    }

    return {
      ngModule: StoreFeatureModule,
      providers
    };
  }
}
