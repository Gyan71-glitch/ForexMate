import { Observable } from 'rxjs';
export interface DomainEvent<T = any> {
    type: string;
    payload: T;
    timestamp: Date;
}
export declare class DomainEventBus {
    private readonly logger;
    private readonly eventSubject$;
    publish<T = any>(type: string, payload: T): void;
    get stream$(): Observable<DomainEvent>;
    ofEvent<T = any>(type: string): Observable<DomainEvent<T>>;
}
