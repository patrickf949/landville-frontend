import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

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
  success(message: ToastInput, title?: string, _options?: unknown): void {
    toast.success(toastMessage(title || message), title ? { description: toastMessage(message) } : undefined);
  }

  error(message: ToastInput, title?: string, _options?: unknown): void {
    toast.error(toastMessage(title || message), title ? { description: toastMessage(message) } : undefined);
  }

  info(message: ToastInput, title?: string, _options?: unknown): void {
    toast.info(toastMessage(title || message), title ? { description: toastMessage(message) } : undefined);
  }

  warning(message: ToastInput, title?: string, _options?: unknown): void {
    toast.warning(toastMessage(title || message), title ? { description: toastMessage(message) } : undefined);
  }

  clear(): void {
    toast.dismiss();
  }
}

@NgModule({
  imports: [NgxSonnerToaster],
  exports: [NgxSonnerToaster]
})
export class ToastrModule {
  static forRoot(): ModuleWithProviders<ToastrModule> {
    return {
      ngModule: ToastrModule,
      providers: [ToastrService]
    };
  }
}
