import { Injectable } from '@nestjs/common';
import { SearchStockDto } from './dto/search-stock.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ITransaction, IOrders } from './interface/order.interface';
import { IProductType } from './interface/product-type.interface';
import { CheckEmpty } from 'src/utils/checkEmpty.utils';
import { IBaseResponse, IResponseOrder, ISearchData } from './interface/response.interface';

@Injectable()
export class SearchStockService {
  private categories: IProductType;

  constructor(
    private readonly httpService: HttpService,
    private checkEmpty: CheckEmpty
  ) { }

  public async searchStock(searchStockDto: SearchStockDto) {

    let order = await this.getOrder()
    this.categories = await this.getProductType();

    const {
      startDate,
      endDate,
      category,
      subCategory,
      firstPrice,
      lastPrice,
      grade,
      searchOrderId
    } = searchStockDto

    if (this.checkEmpty.checkStringNotEmpty(searchOrderId)) {
      order.buyTransaction = await this.getBuySearchOrderId(order.buyTransaction, searchOrderId)
      order.sellTransaction = await this.getBuySearchOrderId(order.sellTransaction, searchOrderId)
    } else {
      if (this.checkEmpty.checkStringNotEmpty(startDate) && this.checkEmpty.checkStringNotEmpty(endDate)) {
        order.buyTransaction = await this.filterByDate(order.buyTransaction, startDate, endDate)
        order.sellTransaction = await this.filterByDate(order.sellTransaction, startDate, endDate)
      }

      if (this.checkEmpty.checkStringNotEmpty(category)) {
        order.buyTransaction = await this.filterByCategory(order.buyTransaction, category)
        order.sellTransaction = await this.filterByCategory(order.sellTransaction, category)
      }

      if (this.checkEmpty.checkStringNotEmpty(subCategory)) {
        order.buyTransaction = await this.getSubCategory(order.buyTransaction, subCategory)
        order.sellTransaction = await this.getSubCategory(order.sellTransaction, subCategory)
      }

      if (this.checkEmpty.checkStringNotEmpty(firstPrice) && this.checkEmpty.checkStringNotEmpty(lastPrice)) {
        order.buyTransaction = await this.filterByPrice(order.buyTransaction, firstPrice, lastPrice)
        order.sellTransaction = await this.filterByPrice(order.sellTransaction, firstPrice, lastPrice)
      }

      if (this.checkEmpty.checkStringNotEmpty(grade)) {
        order.buyTransaction = await this.filterByGrade(order.buyTransaction, grade)
        order.sellTransaction = await this.filterByGrade(order.sellTransaction, grade)
      }
    }

    const mappedData = await this.mapData(order);

    return mappedData
  }

  private async mapData(order: IOrders): Promise<IBaseResponse> {
    const result: ISearchData[] = [];

    const buyMap = new Map();
    const sellMap = new Map();
    let buyTotalTransaction = 0;
    let sellTotalTransaction = 0;
    let buyTotalAmount = 0;
    let sellTotalAmount = 0;
    let buyTotalQuantity = 0;
    let sellTotalQuantity = 0;

    order.buyTransaction.forEach(transaction => {
      transaction.requestList.forEach(request => {
        request.requestList.forEach(item => {
          const key = `${request.categoryID}-${request.subCategoryID}-${item.grade}`;
          if (!buyMap.has(key)) {
            buyMap.set(key, { price: 0, quantity: 0 });
          }
          const current = buyMap.get(key);
          current.price += item.price * parseFloat(item.quantity);
          current.quantity += parseFloat(item.quantity);
          buyTotalTransaction++;
          buyTotalAmount += item.price * parseFloat(item.quantity);
          buyTotalQuantity += parseFloat(item.quantity);
        });
      });
    });

    order.sellTransaction.forEach(transaction => {
      transaction.requestList.forEach(request => {
        request.requestList.forEach(item => {
          const key = `${request.categoryID}-${request.subCategoryID}-${item.grade}`;
          if (!sellMap.has(key)) {
            sellMap.set(key, { price: 0, quantity: 0 });
          }
          const current = sellMap.get(key);
          current.price += item.price * parseFloat(item.quantity);
          current.quantity += parseFloat(item.quantity);
          sellTotalTransaction++;
          sellTotalAmount += item.price * parseFloat(item.quantity);
          sellTotalQuantity += parseFloat(item.quantity);
        });
      });
    });

    buyMap.forEach((buyValue, key) => {
      const sellValue = sellMap.get(key) || { price: 0, quantity: 0 };
      const [categoryID, subCategoryID, grade] = key.split('-');
      const subCategoryName = this.getSubCategoryName(categoryID, subCategoryID);
      result.push({
        categoryName: `${subCategoryName} ${grade}`,
        buy: [{
          price: Number(buyValue.price),
          quantity: Number(buyValue.quantity)
        }],
        sell: [{
          price: Number(sellValue.price),
          quantity: Number(sellValue.quantity)
        }],
        differenceAmount: buyValue.price - sellValue.price,
        differenceQuantity: buyValue.quantity - sellValue.quantity
      });
    });

    const responseOrder: IResponseOrder = {
      searchDatas: result,
      buyTotalAmount,
      sellTotalAmount,
      buyTotalQuantity,
      sellTotalQuantity,
      buyTotalTransaction,
      sellTotalTransaction
    }

    const responseData: IBaseResponse = {
      responseStatus: 200,
      responseMessage: 'Success',
      data: responseOrder
    }

    return responseData;
  }

  private getSubCategoryName(categoryID: string, subCategoryID: string): string {
    const category = this.categories.productList.find(cat => cat.categoryId === categoryID);
    if (category) {
      const subCategory = category.subcategory.find(sub => sub.subCategoryId === subCategoryID);
      if (subCategory) {
        return subCategory.subCategoryName;
      }
    }
    return '';
  }

  public async getCategory(): Promise<IBaseResponse> {
    const productsType = await this.getProductType()
    const responseData: IBaseResponse = {
      responseStatus: 200,
      responseMessage: 'Success',
      data: productsType.productList
    }
    return responseData
  }

  private async filterByDate(data: ITransaction[], startDate: string, endDate: string): Promise<ITransaction[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return data.filter(order => {
      const orderDate = new Date(order.orderFinishedDate);
      return orderDate >= start && orderDate <= end;
    });
  }

  private async filterByCategory(data: ITransaction[], category: string): Promise<ITransaction[]> {
    const result = data.filter(order => {
      const filteredRequestList = order.requestList.filter(requestList => {
        if (requestList.categoryID === category) {
          return requestList
        }
      });
      order.requestList = filteredRequestList;

      return filteredRequestList.length > 0;
    });
    return result;
  };

  private async getSubCategory(data: ITransaction[], subCategory: string): Promise<ITransaction[]> {
    const result = data.filter(order => {
      const filteredRequestList = order.requestList.filter(requestList => {
        if (requestList.subCategoryID === subCategory) {
          return requestList
        }

      });
      order.requestList = filteredRequestList;
      return filteredRequestList.length > 0;
    });

    return result;
  }

  private async filterByPrice(data: ITransaction[], firstPrice: string, lastPrice: string): Promise<ITransaction[]> {
    const minPrice = parseFloat(firstPrice);
    const maxPrice = parseFloat(lastPrice);

    const result = data.filter(order => {
      const filteredRequestList = order.requestList.filter(requestList => {
        const filteredRequestListInside = requestList.requestList.filter(requestListInside => {
          return requestListInside.price >= minPrice && requestListInside.price <= maxPrice;
        });
        requestList.requestList = filteredRequestListInside;
        return filteredRequestListInside.length > 0;
      });
      order.requestList = filteredRequestList;
      return filteredRequestList.length > 0;
    });

    return result;
  }

  private async filterByGrade(data: ITransaction[], grade: string): Promise<ITransaction[]> {
    const result = data.filter(order => {
      const filteredRequestList = order.requestList.filter(requestList => {
        const filteredRequestListInside = requestList.requestList.filter(requestListInside => {
          return requestListInside.grade === grade && requestListInside.total !== 0;
        });
        requestList.requestList = filteredRequestListInside;
        return filteredRequestListInside.length > 0;
      });
      order.requestList = filteredRequestList;
      return filteredRequestList.length > 0;
    });

    return result;
  };

  private async getBuySearchOrderId(data: ITransaction[], searchOrderId: string): Promise<ITransaction[]> {
    return data.filter(order => {
      return order.orderId.includes(searchOrderId);
    });
  }

  private async getOrder(): Promise<IOrders> {
    const urlOrder = 'https://apirecycle.unii.co.th/Stock/query-transaction-demo'
    const response = await firstValueFrom(this.httpService.get(urlOrder))
    return response.data
  }

  private async getProductType(): Promise<IProductType> {
    const urlProductType = 'https://apirecycle.unii.co.th/category/query-product-demo'
    const response = await firstValueFrom(this.httpService.get(urlProductType))
    return response.data
  }
}
