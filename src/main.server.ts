import { enableProdMode } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppServerModule } from 'src/app/app.server.module';

if (environment.production) {
  enableProdMode();
}

export { AppServerModule };
export default AppServerModule;
