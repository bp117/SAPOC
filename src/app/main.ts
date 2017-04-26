//main entry point
// The browser platform with a compiler
import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// The app module
import { AppModule }              from './app.module';

// Compile and launch the module
platformBrowserDynamic().bootstrapModule(AppModule);