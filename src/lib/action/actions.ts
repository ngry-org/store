import { NextObserver, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { IAction } from './action.interface';

/**
 * Represents stream of actions.
 * @since 1.0.0
 * @author Alex Chugaev
 */
@Injectable({
  providedIn: 'root',
})
export class Actions extends Observable<IAction> implements NextObserver<IAction> {
  private readonly actionSubject = new Subject<IAction>();

  /**
   * Initializes new instance.
   */
  constructor() {
    super(subscriber => {
      return this.actionSubject.subscribe(subscriber);
    });
  }

  /**
   * Publishes next action.
   * @param action Instance of action
   * @since 1.0.0
   */
  next(action: IAction): void {
    this.actionSubject.next(action);
  }
}
