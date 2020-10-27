import { FindOperator } from "typeorm";

export interface RecipeArg {
    recipe: RecipeData
}

export interface RecipeData {
    id?: number,
    name: string,
    description: string,
    ingredients: string,
    userId: number, 
    categoryId?: number,
}

export interface UpdtRecipeArg {
    recipe: UpdtRecipe
}

export interface UpdtRecipe {
    id: number,
    name?: string,
    description?: string,
    ingredients?: string,
    userId?: number, 
    category: any
}

export interface RecipeIdArg {
    id: number
}

export interface FilterRecipeArg {
    filter: FilterRecipe
}

export interface FilterRecipe {
    name?: string
    description?: string
    ingredients?: string
    category?: number
    user?: number
}

// Query Interface

export interface ICatId {
    id: number | undefined
}  

export interface IQuery {
    name: FindOperator<string>;
    description: FindOperator<string>;
    ingredients: FindOperator<string>;
    category?: ICatId | undefined 
    user?: ICatId
}