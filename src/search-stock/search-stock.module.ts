import { Module } from '@nestjs/common';
import { SearchStockService } from './search-stock.service';
import { SearchStockController } from './search-stock.controller';
import { HttpModule } from '@nestjs/axios';
import { CheckEmpty } from 'src/utils/checkEmpty.utils';

@Module({
  imports: [HttpModule],
  controllers: [SearchStockController],
  providers: [
    SearchStockService,
    CheckEmpty
  ],
})
export class SearchStockModule {}
