import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface DomainEvent {
  id: string;
  name: string;
  payload: any;
  timestamp: Date;
}

@Injectable()
export class DevEventsService {
  private events: DomainEvent[] = [];

  constructor() {
    // Seed a few initial events to show tracer works
    this.emit('SystemStarted', { nodeVersion: process.version, env: process.env.NODE_ENV });
  }

  emit(name: string, payload: any) {
    const event: DomainEvent = {
      id: crypto.randomUUID(),
      name,
      payload,
      timestamp: new Date(),
    };
    this.events.unshift(event);
    
    // Cap at 200 items
    if (this.events.length > 200) {
      this.events.pop();
    }
    return event;
  }

  getEvents(filter?: string, search?: string) {
    let filtered = [...this.events];

    if (filter && filter !== 'ALL') {
      filtered = filtered.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(q) || 
        JSON.stringify(e.payload).toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  replayEvent(eventId: string) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found.`);
    }

    // Re-emit it as a replayed event
    return this.emit(`${event.name}:REPLAYED`, {
      originalEventId: event.id,
      replayedAt: new Date(),
      payload: event.payload
    });
  }

  clearEvents() {
    this.events = [];
    return { success: true };
  }
}
