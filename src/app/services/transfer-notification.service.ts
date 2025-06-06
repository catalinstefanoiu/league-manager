import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferNotificationService {
  private transfersSubject = new BehaviorSubject<any[]>([]);
  public transfers$ = this.transfersSubject.asObservable();

  private currentTransfers: any[] = [];

  pushTransfer(data: { playerId?: string; value?: string; message?: string; timestamp?: Date }) {
    const transfer = {
      playerId: data.playerId ?? 'Unknown',
      value: data.value ?? 'N/A',
      message: data.message ?? 'Transfer received',
      timestamp: data.timestamp?.getTime() ?? Date.now()
    };

    this.currentTransfers.unshift(transfer);
    this.transfersSubject.next([...this.currentTransfers]);
  }

   updateNotifications(notifications: any[]) {
    this.currentTransfers = [...notifications];
    this.transfersSubject.next(this.currentTransfers);
  }
}
