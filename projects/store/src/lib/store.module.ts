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

@NgModule()
export class StoreModule {
  static forRoot(configuration: StoreModuleConfiguration = {}): ModuleWithProviders {
    const providers: Provider[] = [
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
      ...(configuration.effects || []).map(effectsClass => {
        return {
          provide: EFFECTS,
          useClass: effectsClass,
          multi: true
        };
      }),
      ...(configuration.errorHandlers || []).map(errorHandlerClass => {
        return {
          provide: ERROR_HANDLERS,
          useClass: errorHandlerClass,
          multi: true
        };
      })
    ];

    return {
      ngModule: StoreModule,
      providers: providers
    };
  }

  static forFeature(configuration: StoreModuleConfiguration): ModuleWithProviders {
    const providers: Provider[] = [
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
      ...(configuration.effects || []).map(effectsClass => {
        return {
          provide: EFFECTS,
          useClass: effectsClass,
          multi: true
        };
      }),
      ...(configuration.errorHandlers || []).map(errorHandlerClass => {
        return {
          provide: ERROR_HANDLERS,
          useClass: errorHandlerClass,
          multi: true
        };
      })
    ];

    return {
      ngModule: StoreModule,
      providers: providers
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
