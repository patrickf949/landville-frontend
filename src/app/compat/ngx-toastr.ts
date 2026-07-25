import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { HotToastService, provideHotToastConfig } from '@ngxpert/hot-toast';

type ToastInput = string | Error | unknown;

function toastMessage(message: ToastInput): string {
  if (message instanceof Error) {
    return message.message;
  }
  if (typeof message === 'string') {
    return message;
  }
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

@Injectable({ providedIn: 'root' })
export class ToastrService {
  constructor(private toast: HotToastService) {}

  success(message: ToastInput, title?: string, _options?: unknown): void {
    const msg = title ? `${title}: ${toastMessage(message)}` : toastMessage(message);
    this.toast.success(msg);
  }

  error(message: ToastInput, title?: string, _options?: unknown): void {
    const msg = title ? `${title}: ${toastMessage(message)}` : toastMessage(message);
    this.toast.error(msg);
  }

  info(message: ToastInput, title?: string, _options?: unknown): void {
    const msg = title ? `${title}: ${toastMessage(message)}` : toastMessage(message);
    this.toast.info(msg);
  }

  warning(message: ToastInput, title?: string, _options?: unknown): void {
    const msg = title ? `${title}: ${toastMessage(message)}` : toastMessage(message);
    this.toast.warning(msg);
  }

  clear(): void {
    this.toast.close();
  }
}

@NgModule({})
export class ToastrModule {
  static forRoot(): ModuleWithProviders<ToastrModule> {
    return {
      ngModule: ToastrModule,
      providers: [
        ToastrService,
        provideHotToastConfig()
      ]
    };
  }
}
