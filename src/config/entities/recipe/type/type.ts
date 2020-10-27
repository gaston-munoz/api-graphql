const schema = `
    type Recipe {
        id: ID
        name: String!
        description: String!
        ingredients: String!
        user: User 
        category: Category
    }

    input CreateRecipeInput {
        name: String!
        description: String!
        ingredients: String!
        categoryId: Int!
    }

    input UpdateRecipeInput {
        id: ID!
        name: String
        description: String
        ingredients: String
        userId: Int
        category: Int
    }

    input FilterRecipe {
        name: String
        description: String
        ingredients: String
        category: Int
    }

    type Query {

        getRecipes(filter: FilterRecipe): [Recipe]
        getMyRecipes(filter: FilterRecipe): [Recipe]
        getOneRecipe(id: ID!): Recipe   
    }


    type Mutation {

        createRecipe(recipe: CreateRecipeInput!): Recipe
        updateRecipe(recipe: UpdateRecipeInput!): Recipe
        deleteRecipe(id: ID!): Recipe

    }
`;

export default schema;
