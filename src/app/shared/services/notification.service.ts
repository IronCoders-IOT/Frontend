import { Injectable, ComponentRef, createComponent, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { NotificationComponent } from '../components/notification/notification.component';

export interface NotificationOptions {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: ComponentRef<NotificationComponent>[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  show(options: NotificationOptions): void {
    const notificationComponent = createComponent(NotificationComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    // Configurar la notificación
    (notificationComponent.instance as NotificationComponent).message = options.message;
    (notificationComponent.instance as NotificationComponent).type = options.type;
    (notificationComponent.instance as NotificationComponent).duration = options.duration || 4000;
    (notificationComponent.instance as NotificationComponent).position = options.position || 'bottom-right';

    // Agregar al DOM
    const domElem = (notificationComponent.hostView as EmbeddedViewRef<any>).rootNodes[0];
    document.body.appendChild(domElem);

    // Agregar a la lista de notificaciones
    this.notifications.push(notificationComponent);

    // Configurar el evento de cierre
    (notificationComponent.instance as NotificationComponent).onClose.subscribe(() => {
      this.removeNotification(notificationComponent);
    });

    // Auto-remover después del tiempo especificado
    if (options.duration !== 0) {
      setTimeout(() => {
        this.removeNotification(notificationComponent);
      }, options.duration || 4000);
    }

    // Detectar cambios
    this.appRef.attachView(notificationComponent.hostView);
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  private removeNotification(notification: ComponentRef<NotificationComponent>): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }

    // Remover del DOM
    const domElem = (notification.hostView as EmbeddedViewRef<any>).rootNodes[0];
    if (domElem.parentNode) {
      domElem.parentNode.removeChild(domElem);
    }

    // Detectar cambios
    this.appRef.detachView(notification.hostView);
    notification.destroy();
  }

  clearAll(): void {
    this.notifications.forEach(notification => {
      this.removeNotification(notification);
    });
  }
} 