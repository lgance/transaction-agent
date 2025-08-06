/** Common Import  */
import { Module } from '@nestjs/common';

/** External Library Import  */
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

/** Modules */
import { ConnectivityModule } from './connectivity/connectivity.module';

// import { ValidationModule } from './validation/validation.module';


/** Dev Controller */
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'server_static'),
      serveRoot: '/',
    }),
    ConnectivityModule,
    // ValidationModule, // Added ValidationModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
