import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderContentComponent } from '../../../public/components/header-content/header-content.component';
import { ResidentService } from '../../services/resident.service';
import { Resident } from '../../models/resident.model';
import { TranslationService } from '../../../shared/services/translation.service';

declare var MercadoPago: any;

@Component({
  selector: 'app-create-resident',
  templateUrl: './create-resident.component.html',
  styleUrls: ['./create-resident.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderContentComponent]
})
export class CreateResidentComponent implements OnInit, AfterViewInit, OnDestroy {
  residentForm!: FormGroup;
  isSubmitting = false;

  // MercadoPago variables
  mp: any;
  paymentBrickController: any;
  paymentCompleted = false;
  paymentStatus: string | null = null;
  paymentStatusMessage = '';
  paymentStatusClass = '';

  // Nueva variable para controlar si el formulario está completo
  isFormComplete = false;

  // Variables para controlar la inicialización de MercadoPago
  private mercadoPagoInitialized = false;
  private mercadoPagoScriptLoaded = false;

  // Credenciales de test
  private readonly PUBLIC_KEY = 'TEST-0048c430-d4a9-4088-a0e9-3ba720f06760';
  private readonly PAYMENT_AMOUNT = 200; // Monto en soles

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private residentService: ResidentService,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkAuthentication();
    this.setupFormValidation();
    this.loadMercadoPagoScript();
  }

  ngAfterViewInit(): void {
    // Solo intentamos inicializar si el script ya está cargado y no hemos inicializado aún
    if (this.mercadoPagoScriptLoaded && !this.mercadoPagoInitialized) {
      setTimeout(() => {
        this.initializeMercadoPago();
      }, 500);
    }
  }

  ngOnDestroy(): void {
    // Limpiar el brick al destruir el componente
    if (this.paymentBrickController) {
      try {
        this.paymentBrickController.unmount();
        this.paymentBrickController = null;
      } catch (error) {
        console.error('Error unmounting payment brick:', error);
      }
    }

    // Reset de variables de control
    this.mercadoPagoInitialized = false;
    this.mercadoPagoScriptLoaded = false;
  }

  private initializeForm(): void {
    this.residentForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      documentType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      direction: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      waterTankSize: [null, [Validators.required, Validators.min(1)]]
    });
  }

  private setupFormValidation(): void {
    // Escuchar cambios en el formulario para verificar si está completo
    this.residentForm.valueChanges.subscribe(() => {
      this.isFormComplete = this.residentForm.valid;
    });
  }

  private checkAuthentication(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');

    console.log('=== VERIFICACIÓN DE AUTENTICACIÓN ===');
    console.log('Token encontrado:', token ? 'SÍ' : 'NO');
    console.log('Usuario encontrado:', user ? 'SÍ' : 'NO');

    if (!token || !user) {
      console.error('Usuario no autenticado - redirigiendo al login');
      this.snackBar.open('Please log in to create residents', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center'
      });
      this.router.navigate(['/login']);
      return;
    }

    try {
      const userData = JSON.parse(user);
      console.log('Datos del usuario:', userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.router.navigate(['/login']);
      return;
    }

    console.log('=== USUARIO AUTENTICADO CORRECTAMENTE ===');
  }

  private loadMercadoPagoScript(): void {
    // Verificar si ya está cargado
    if (typeof MercadoPago !== 'undefined') {
      this.mercadoPagoScriptLoaded = true;
      this.initializeMercadoPago();
      return;
    }

    // Verificar si el script ya está siendo cargado
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
      this.showPaymentError('Error loading payment system');
    };
    document.head.appendChild(script);
  }

  private initializeMercadoPago(): void {
    try {
      // Verificar si ya está inicializado
      if (this.mercadoPagoInitialized) {
        console.log('MercadoPago already initialized, skipping...');
        return;
      }

      if (typeof MercadoPago === 'undefined') {
        console.error('MercadoPago SDK not loaded');
        return;
      }

      if (this.paymentBrickController) {
        console.log('Payment Brick already exists, unmounting first...');
        this.paymentBrickController.unmount();
        this.paymentBrickController = null;
      }

      // Limpiar el contenedor antes de inicializar
      const container = document.getElementById('paymentBrick_container');
      if (container) {
        container.innerHTML = '';
      }

      this.mp = new MercadoPago(this.PUBLIC_KEY, {
        locale: 'es-PE'
      });

      const bricksBuilder = this.mp.bricks();
      this.renderPaymentBrick(bricksBuilder);

      // Marcar como inicializado
      this.mercadoPagoInitialized = true;
      console.log('MercadoPago initialized successfully');
    } catch (error) {
      console.error('Error initializing MercadoPago:', error);
      this.showPaymentError('Error initializing payment system');
    }
  }

  private async renderPaymentBrick(bricksBuilder: any): Promise<void> {
    // Verificar que el contenedor existe antes de proceder
    const container = document.getElementById('paymentBrick_container');
    if (!container) {
      console.error('Payment container not found');
      this.showPaymentError('Payment form container not available');
      return;
    }

    // Verificar si ya hay un brick controller activo
    if (this.paymentBrickController) {
      console.log('Payment Brick already exists, skipping creation');
      return;
    }

    const settings = {
      initialization: {
        amount: this.PAYMENT_AMOUNT,
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
          debitCard: "all", // Habilitar tarjetas de débito
          ticket: "all",
          bankTransfer: "all",
          atm: "all",
          onboarding_credits: "all",
          maxInstallments: 12, // Aumentamos las cuotas máximas
          // Configuración específica para tarjetas de débito
          excludedPaymentTypes: [], // No excluimos ningún tipo
          excludedPaymentMethods: [] // No excluimos ningún método específico
        },
        // Configuraciones adicionales para mejorar compatibilidad
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

          if (selectedPaymentMethod === 'debit_card' ||
            (formData.payment_method_id && formData.payment_method_id.includes('debito'))) {
            console.log('Processing debit card payment');
          }

          return this.processPayment(formData);
        },
        onError: (error: any) => {
          console.error('Payment Brick error:', error);
          if (error.message && error.message.includes('debit')) {
            this.showPaymentError('There was an issue processing your debit card. Please try again or use a different payment method.');
          } else {
            this.showPaymentError('Payment error occurred. Please try again.');
          }
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
      this.showPaymentError('Error creating payment form');
    }
  }

  private async processPayment(formData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulamos el procesamiento del pago
      console.log('Processing payment with data:', formData);
      this.isSubmitting = true;

      // Validación específica para tarjetas de débito
      if (formData.card && formData.card.cardNumber) {
        // Simulamos validación de número de tarjeta
        const cardNumber = formData.card.cardNumber.replace(/\s/g, '');

        // Algunos números de tarjeta de débito de prueba válidos para MercadoPago
        const validDebitCards = [
          '5031755734530604', // Maestro
          '5170424914398815', // Mastercard Debit
          '4002751696129753', // Visa Debit
          '4001020000000004', // Visa Debit
          '5155901222280001'  // Mastercard Debit
        ];

        // Si es una tarjeta de débito y no está en la lista de válidas, la aceptamos igual
        console.log('Processing card number:', cardNumber);
      }

      // Simulamos una llamada al servidor
      setTimeout(() => {
        // Aumentamos la probabilidad de éxito para tarjetas de débito
        const success = Math.random() > 0.1; // 90% de probabilidad de éxito

        if (success) {
          // Primero procesamos el pago exitoso
          this.processSuccessfulPayment();
          resolve();
        } else {
          // Error más específico según el tipo de problema
          const errorMessages = [
            'Payment declined. Please verify your card information.',
            'Insufficient funds. Please try with a different card.',
            'Card expired. Please use a valid card.',
            'Payment processing error. Please try again.'
          ];
          const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];

          this.showPaymentError(randomError);
          this.isSubmitting = false;
          reject(new Error('Payment failed'));
        }
      }, 2000);
    });
  }

  private processSuccessfulPayment(): void {
    // Crear el residente después del pago exitoso
    const resident = new Resident(this.residentForm.value);
    const residentData = resident.toCreateRequest();

    this.residentService.createResident(residentData).subscribe({
      next: () => {
        this.showSuccessMessage();
      },
      error: (err) => {
        console.error('Error al crear el residente:', err);
        this.isSubmitting = false;
        this.showPaymentError('Payment successful but error creating resident');
      }
    });
  }

  private showSuccessMessage(): void {
    this.paymentStatus = 'success';
    this.paymentStatusMessage = '¡Payment completed successfully! Creating resident and redirecting...';
    this.paymentStatusClass = 'payment-success';
    this.paymentCompleted = true;

    // Mostrar snackbar solo con mensaje de pago exitoso
    this.snackBar.open('¡Payment completed successfully!', 'Close', {
      duration: 6000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['custom-snackbar']
    });

    // Redirigir después de 6 segundos
    setTimeout(() => {
      this.router.navigate(['/residents']);
    }, 6000);
  }

  private showPaymentError(message: string): void {
    this.paymentStatus = 'error';
    this.paymentStatusMessage = message;
    this.paymentStatusClass = 'payment-error';
    this.paymentCompleted = false;

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar']
    });
  }

  onSubmit(): void {
    // Este método ya no se usa para el registro, solo para validar el formulario
    if (this.residentForm.invalid) {
      this.residentForm.markAllAsTouched();
      return;
    }
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
