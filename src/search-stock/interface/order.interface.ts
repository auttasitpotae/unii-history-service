export interface IOrders {
    buyTransaction: ITransaction[]
    sellTransaction: ITransaction[]
}

export interface ITransaction {
    orderId: string
    requestList: IRequestList[]
    transactionParties: ITransactionParties
    orderFinishedDate: string
    orderFinishedTime: string
}

export interface IRequestList {
    categoryID: string
    requestList: IRequestListInSide[]
    subCategoryID: string
}

export interface IRequestListInSide {
    grade: string
    price: number
    quantity: string
    total: number
}

export interface ITransactionParties {
    customer: ICustomer
    transport: ICustomer
    collector: ICustomer
}

export interface ICustomer {
    roleName: string,
    name: string,
    id: string
}