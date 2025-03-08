import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchStockModule } from './search-stock/search-stock.module';

@Module({
  imports: [SearchStockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
