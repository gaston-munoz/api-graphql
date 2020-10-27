export interface ICategoryArg {
    input: CategoryData
}

export interface CategoryArg {
    category: CategoryData
}

export interface CategoryData {
    id:number,
    name: string,
}

export interface CategoryId {
    id: number
}

export interface FilterCategoryArg {
    filter?: FilterCategory
}

export interface FilterCategory {
    name?: string
}
