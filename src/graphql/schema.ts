import  { gql } from 'apollo-server';

const typeDefs = gql`

    # User types

    type User {
        id: ID
        name: String
        email: String
        createdAt: String
    }

    type UserToken {
        user: User
        token: String
    }

    input UserInput {
        name: String!
        email: String!
        password: String!
    }

    input UserLoginInput {
        email: String
        password: String
    }

    # Categories Type

    type Category {
        id: ID
        name: String
        userId: Int
    }

    input NewCategoryInput {
        name: String,
        userId: Int
    }

    input updateCategoryInput {
        id: ID!,
        name: String,
        userId: Int
    }

    # Recipe Types

    type Recipe {
        id: ID
        name: String!
        description: String!
        ingredients: String!
        userId: Int 
        categoryId: Int
    }

    input CreateRecipeInput {
        name: String!
        description: String!
        ingredients: String!
        userId: Int !
        categoryId: Int!
    }
    
    input UpdateRecipeInput {
        id: ID!
        name: String
        description: String
        ingredients: String
        userId: Int
        categoryId: Int
    }


    # main

    type Query {
        # User
        getUser(token: String!): User
        users: [User]

        # Category
        categories: [Category] 
        category(id: ID!): Category
          # userCategories(userId: ID!): [Categories]

        # Recipe
        recipes: [Recipe]
        recipe(id: ID!): Recipe   
    }

    
    type Mutation {
        # User
        registry(user: UserInput!): User
        login(user: UserLoginInput!): UserToken

        # Category
        createCategory(input: NewCategoryInput!): Category
        deleteCategory(id: ID!): Category  
        updateCategory(category: updateCategoryInput): Category

        # Recipes 

        createRecipe(recipe: CreateRecipeInput!): Recipe
        updateRecipe(recipe: UpdateRecipeInput!): Recipe
        deleteRecipe(id: ID!): Recipe

    }
`;

export default typeDefs;