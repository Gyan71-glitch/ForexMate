import { Injectable } from '@nestjs/common';
import { DomainEventBus, DomainEvent } from '../event-bus/domain-event-bus.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SyncService {
  constructor(private readonly eventBus: DomainEventBus) {}

  getSyncStream(): Observable<{ data: { type: string; payload: any } }> {
    return this.eventBus.stream$.pipe(
      map((event: DomainEvent) => ({
        data: {
          type: event.type,
          payload: event.payload,
        },
      }))
    );
  }
}
