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

export function ActionsFactory(): Actions {
  return new Actions();
}

export function ErrorsFactory(): Errors {
  return new Errors();
}

export function ConvertEffectsToProviders(effects: Array<Type<object>> = []): Provider[] {
  return effects.map(effectsClass => {
    return {
      provide: EFFECTS,
      useClass: effectsClass,
      multi: true
    };
  });
}

export function ConvertErrorHandlersToProviders(effects: Array<Type<object>> = []): Provider[] {
  return effects.map(errorHandlerClass => {
    return {
      provide: ERROR_HANDLERS,
      useClass: errorHandlerClass,
      multi: true
    };
  });
}

@NgModule({
  providers: [
    {
      provide: Actions,
      useFactory: ActionsFactory
    },
    {
      provide: Errors,
      useFactory: ErrorsFactory
    }
  ]
})
export class StoreRootModule {
}

@NgModule()
export class StoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: StoreRootModule
    };
  }

  static forFeature(configuration: StoreModuleConfiguration): ModuleWithProviders {
    const providers = [
      ...(configuration.store ? [
        {
          provide: configuration.store,
          useClass: configuration.store
        },
        {
          provide: STORE,
          useExisting: configuration.store
        }
      ] : []),
      ...ConvertEffectsToProviders(configuration.effects),
      ...ConvertErrorHandlersToProviders(configuration.errorHandlers)
    ];

    return {
      ngModule: StoreModule,
      providers
    };
  }

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
