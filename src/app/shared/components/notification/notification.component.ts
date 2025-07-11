import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="notification-container"
      [ngClass]="[position, type, 'show']"
      (click)="close()">
      <div class="notification-content">
        <div class="notification-icon">
          <span *ngIf="type === 'success'">✓</span>
          <span *ngIf="type === 'error'">✕</span>
          <span *ngIf="type === 'info'">ℹ</span>
          <span *ngIf="type === 'warning'">⚠</span>
        </div>
        <div class="notification-message">
          {{ message }}
        </div>
        <button class="notification-close" (click)="close($event)">
          <span>×</span>
        </button>
      </div>
      <div class="notification-progress" *ngIf="duration > 0">
        <div class="progress-bar" [style.width.%]="progressWidth"></div>
      </div>
    </div>
  `,
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: NotificationType = 'info';
  @Input() duration: number = 4000;
  @Input() position: NotificationPosition = 'bottom-right';
  
  @Output() onClose = new EventEmitter<void>();

  progressWidth: number = 100;
  private progressInterval: any;

  ngOnInit(): void {
    if (this.duration > 0) {
      this.startProgress();
    }
  }

  ngOnDestroy(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  private startProgress(): void {
    const startTime = Date.now();
    const endTime = startTime + this.duration;
    
    this.progressInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const remaining = this.duration - elapsed;
      
      this.progressWidth = (remaining / this.duration) * 100;
      
      if (remaining <= 0) {
        this.close();
      }
    }, 10);
  }

  close(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    this.onClose.emit();
  }
} 