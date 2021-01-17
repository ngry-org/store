import { NextObserver, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { IAction } from './action.interface';

@Injectable({
  providedIn: 'root',
})
export class Actions extends Observable<IAction> implements NextObserver<IAction> {
  private readonly actionSubject = new Subject<IAction>();

  constructor() {
    super(subscriber => {
      return this.actionSubject.subscribe(subscriber);
    });
  }

  next(action: IAction): void {
    this.actionSubject.next(action);
  }
}
