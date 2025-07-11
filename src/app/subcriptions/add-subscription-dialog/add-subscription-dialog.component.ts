import { Component, Inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../shared/services/translation.service';
import { LanguageService } from '../../shared/services/language.service';
import { NotificationService } from '../../shared/services/notification.service';
import { subscriptionTranslations } from './translations';
import { environment } from '../../../environments/environment';

declare var MercadoPago: any;

export interface AddSubscriptionData {
  residentId: number;
}

@Component({
  selector: 'app-add-subscription-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-subscription-dialog.component.html',
  styleUrls: ['./add-subscription-dialog.component.css']
})
export class AddSubscriptionDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  subscriptionForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  // MercadoPago variables
  mp: any;
  paymentBrickController: any;
  paymentCompleted = false;
  paymentStatus: string | null = null;
  paymentStatusMessage = '';
  paymentStatusClass = '';
  showPaymentForm = false;
  paymentAmount = 0;
  showPaymentModal = false; // Nueva variable para modal de pago separado

  // Variables para controlar la inicialización de MercadoPago
  private mercadoPagoInitialized = false;
  private mercadoPagoScriptLoaded = false;

  // Credenciales de test
  private readonly PUBLIC_KEY = 'TEST-0048c430-d4a9-4088-a0e9-3ba720f06760';
  readonly FIXED_PRICE = 200; // Precio fijo por dispositivo e instalación en soles

  constructor(
    private dialogRef: MatDialogRef<AddSubscriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddSubscriptionData,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private translationService: TranslationService,
    private languageService: LanguageService,
    private notificationService: NotificationService
  ) {
    this.subscriptionForm = this.formBuilder.group({
      waterTankSize: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]]
    });
  }

  ngOnInit(): void {
    this.setupFormValidation();
    this.loadMercadoPagoScript();
  }

  ngAfterViewInit(): void {
    if (this.mercadoPagoScriptLoaded && !this.mercadoPagoInitialized) {
      setTimeout(() => {
        this.initializeMercadoPago();
      }, 500);
    }
  }

  ngOnDestroy(): void {
    if (this.paymentBrickController) {
      try {
        this.paymentBrickController.unmount();
        this.paymentBrickController = null;
      } catch (error) {
        console.error('Error unmounting payment brick:', error);
      }
    }
    this.mercadoPagoInitialized = false;
    this.mercadoPagoScriptLoaded = false;
  }

  private setupFormValidation(): void {
    this.subscriptionForm.get('waterTankSize')?.valueChanges.subscribe(value => {
      if (value && this.subscriptionForm.get('waterTankSize')?.valid) {
        this.calculatePaymentAmount(value);
        this.showPaymentForm = true;
        // No inicializar MercadoPago aquí, se hará cuando se abra el modal
      } else {
        this.showPaymentForm = false;
        this.paymentAmount = 0;
      }
    });
  }

  private calculatePaymentAmount(liters: number): void {
    this.paymentAmount = this.FIXED_PRICE; // Precio fijo por dispositivo e instalación
  }

  private loadMercadoPagoScript(): void {
    if (typeof MercadoPago !== 'undefined') {
      this.mercadoPagoScriptLoaded = true;
      this.initializeMercadoPago();
      return;
    }

    const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
    if (existingScript) {
      this.mercadoPagoScriptLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      console.log('MercadoPago SDK loaded');
      this.mercadoPagoScriptLoaded = true;
      this.initializeMercadoPago();
    };
    script.onerror = () => {
      console.error('Error loading MercadoPago SDK');
      this.showPaymentError(this.translate('error_loading_payment'));
    };
    document.head.appendChild(script);
  }

  private initializeMercadoPago(): void {
    try {
      if (this.mercadoPagoInitialized || !this.showPaymentForm) {
        return;
      }

      if (typeof MercadoPago === 'undefined') {
        console.error('MercadoPago SDK not loaded');
        return;
      }

      if (this.paymentBrickController) {
        this.paymentBrickController.unmount();
        this.paymentBrickController = null;
      }

      const container = document.getElementById('paymentBrick_container');
      if (container) {
        container.innerHTML = '';
      }

      this.mp = new MercadoPago(this.PUBLIC_KEY, {
        locale: 'es-PE'
      });

      const bricksBuilder = this.mp.bricks();
      this.renderPaymentBrick(bricksBuilder);

      this.mercadoPagoInitialized = true;
      console.log('MercadoPago initialized successfully');
    } catch (error) {
      console.error('Error initializing MercadoPago:', error);
      this.showPaymentError(this.translate('error_initializing_payment'));
    }
  }

  private async renderPaymentBrick(bricksBuilder: any): Promise<void> {
    const container = document.getElementById('paymentBrick_container');
    if (!container) {
      console.error('Payment container not found');
      this.showPaymentError(this.translate('payment_form_unavailable'));
      return;
    }

    if (this.paymentBrickController) {
      console.log('Payment Brick already exists, skipping creation');
      return;
    }

    const settings = {
      initialization: {
        amount: this.paymentAmount,
        payer: {
          firstName: "",
          lastName: "",
          email: "",
        },
      },
      customization: {
        visual: {
          style: {
            theme: "bootstrap",
          },
        },
        paymentMethods: {
          creditCard: "all",
          debitCard: "all",
          ticket: "all",
          bankTransfer: "all",
          atm: "all",
          onboarding_credits: "all",
          maxInstallments: 12,
          excludedPaymentTypes: [],
          excludedPaymentMethods: []
        },
        texts: {
          valueProp: 'smart_option'
        }
      },
      callbacks: {
        onReady: () => {
          console.log('Payment Brick is ready');
        },
        onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
          console.log('Payment submission:', { selectedPaymentMethod, formData });
          return this.processPayment(formData);
        },
        onError: (error: any) => {
          console.error('Payment Brick error:', error);
          this.showPaymentError(this.translate('payment_error'));
        },
      },
    };

    try {
      console.log('Creating Payment Brick...');
      this.paymentBrickController = await bricksBuilder.create(
        "payment",
        "paymentBrick_container",
        settings
      );
      console.log('Payment Brick created successfully');
    } catch (error) {
      console.error('Error creating Payment Brick:', error);
      this.showPaymentError(this.translate('error_creating_payment'));
    }
  }

  private async processPayment(formData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Processing payment with data:', formData);
      this.isLoading = true;

      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% de probabilidad de éxito

        if (success) {
          this.processSuccessfulPayment();
          resolve();
        } else {
          const errorMessages = [
            this.translate('payment_declined'),
            this.translate('insufficient_funds'),
            this.translate('card_expired'),
            this.translate('payment_processing_error')
          ];
          const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];

          this.showPaymentError(randomError);
          this.isLoading = false;
          reject(new Error('Payment failed'));
        }
      }, 2000);
    });
  }

  private processSuccessfulPayment(): void {
    this.paymentStatus = 'success';
    this.paymentStatusMessage = this.translate('payment_completed_success');
    this.paymentStatusClass = 'payment-success';
    this.paymentCompleted = true;

    // Mostrar mensaje de confirmación de pago
    this.notificationService.success(this.translate('payment_completed_success'), 4000);

    // Crear la suscripción después del pago exitoso
    this.createSubscription();
  }

  private createSubscription(): void {
    const subscriptionData = {
      residentId: this.data.residentId,
      waterTankSize: this.subscriptionForm.get('waterTankSize')?.value
    };

    const token = localStorage.getItem('auth_token');
          if (!token) {
        this.isLoading = false;
        this.error = this.translate('session_expired');
        return;
      }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${environment.serverBasePath}subscriptions`, subscriptionData, { headers })
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          // Mostrar mensaje de confirmación de suscripción creada
          this.notificationService.success(this.translate('payment_and_subscription_success'), 6000);

          this.dialogRef.close({ success: true, data: response });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al crear suscripción:', error);

          if (error.status === 401) {
            this.error = this.translate('session_expired');
          } else if (error.status === 400) {
            this.error = this.translate('invalid_data');
          } else {
            this.error = this.translate('error_creating_subscription');
          }
        }
      });
  }

  private showPaymentError(message: string): void {
    this.paymentStatus = 'error';
    this.paymentStatusMessage = message;
    this.paymentStatusClass = 'payment-error';
    this.paymentCompleted = false;
    this.isLoading = false;
  }

  openPaymentModal(): void {
    this.showPaymentModal = true;
    this.mercadoPagoInitialized = false;
    setTimeout(() => {
      this.initializeMercadoPago();
    }, 100);
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    if (this.paymentBrickController) {
      this.paymentBrickController.unmount();
      this.paymentBrickController = null;
    }
    this.mercadoPagoInitialized = false;
  }

  onSubmit(): void {
    if (this.subscriptionForm.valid) {
      // Abrir modal de pago en lugar de procesar directamente
      this.openPaymentModal();
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.subscriptionForm.get(fieldName);
    if (field?.hasError('required')) {
      return this.translate('field_required');
    }
    if (field?.hasError('min')) {
      return this.translate('value_must_be_greater');
    }
    if (field?.hasError('pattern')) {
      return this.translate('only_integers_allowed');
    }
    return '';
  }

  translate(key: string): string {
    const currentLang = this.languageService.getCurrentLanguage();
    const translations = subscriptionTranslations[currentLang as keyof typeof subscriptionTranslations];
    return translations?.[key as keyof typeof translations] || key;
  }
}
