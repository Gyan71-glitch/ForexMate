import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface DomainEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
}

@Injectable()
export class DomainEventBus {
  private readonly logger = new Logger(DomainEventBus.name);
  private readonly eventSubject$ = new Subject<DomainEvent>();

  /**
   * Publishes an event to the bus.
   */
  publish<T = any>(type: string, payload: T): void {
    const event: DomainEvent<T> = {
      type,
      payload,
      timestamp: new Date(),
    };
    this.logger.log(`[DomainEventBus] Publishing event: ${type}`);
    this.eventSubject$.next(event);
  }

  /**
   * Returns the absolute stream of all events.
   */
  get stream$(): Observable<DomainEvent> {
    return this.eventSubject$.asObservable();
  }

  /**
   * Filters the stream for a specific event type.
   */
  ofEvent<T = any>(type: string): Observable<DomainEvent<T>> {
    return this.eventSubject$.pipe(
      filter((event) => event.type === type)
    ) as Observable<DomainEvent<T>>;
  }
}
