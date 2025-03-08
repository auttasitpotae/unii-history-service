export interface IProductType {
    StatusCode: number
    success: boolean
    productList: IProductTypeList[]
}

export interface IProductTypeList {
    categoryId: string
    categoryName: string
    subcategory: ISubCategory[]
}

export interface ISubCategory {
    subCategoryId: string
    subCategoryName: string
}