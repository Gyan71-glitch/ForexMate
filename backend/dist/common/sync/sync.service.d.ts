import { DomainEventBus } from '../event-bus/domain-event-bus.service';
import { Observable } from 'rxjs';
export declare class SyncService {
    private readonly eventBus;
    constructor(eventBus: DomainEventBus);
    getSyncStream(): Observable<{
        data: {
            type: string;
            payload: any;
        };
    }>;
}
