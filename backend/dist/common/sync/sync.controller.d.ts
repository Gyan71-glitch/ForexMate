import { SyncService } from './sync.service';
import { Observable } from 'rxjs';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    sendEvents(req: any): Observable<any>;
}
