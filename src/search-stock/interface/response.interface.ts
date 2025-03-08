export interface IBaseResponse {
    responseStatus: number,
    responseMessage: string,
    data: any
}

export interface IResponseOrder {
    searchDatas: ISearchData[]
    buyTotalAmount: number
    sellTotalAmount: number
    buyTotalQuantity: number
    sellTotalQuantity: number
    buyTotalTransaction: number
    sellTotalTransaction: number
}

export interface ISearchData {
    categoryName: string
    buy: [{
        price: number
        quantity: number
    }]
    sell: [{
        price: number
        quantity: number
    }]
    differenceAmount: number
    differenceQuantity: number
}

