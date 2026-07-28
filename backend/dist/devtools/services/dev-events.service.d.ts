export interface DomainEvent {
    id: string;
    name: string;
    payload: any;
    timestamp: Date;
}
export declare class DevEventsService {
    private events;
    constructor();
    emit(name: string, payload: any): DomainEvent;
    getEvents(filter?: string, search?: string): DomainEvent[];
    replayEvent(eventId: string): DomainEvent;
    clearEvents(): {
        success: boolean;
    };
}
