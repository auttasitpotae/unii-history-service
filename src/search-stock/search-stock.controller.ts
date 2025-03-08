import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SearchStockService } from './search-stock.service';
import { SearchStockDto } from './dto/search-stock.dto';

@Controller('search-stock')
export class SearchStockController {
  constructor(private readonly searchStockService: SearchStockService) {}

  @Get('/category')
  public async getCategory() {
    return await this.searchStockService.getCategory();
  }

  @Post('/search')
  public async searchStock(@Body() searchStockDto: SearchStockDto) {
    return await this.searchStockService.searchStock(searchStockDto);
  }
}
