const schema = `
    type Category {
        id: ID
        name: String
    }

    input NewCategoryInput {
        name: String!
    }

    input updateCategoryInput {
        id: ID!
        name: String!
    }

    input filterCategory {
        name: String
    }

    type Query {

        getCategories(filter: filterCategory): [Category] 
        getOneCategory(id: ID!): Category
    }

    type Mutation {

        createCategory(input: NewCategoryInput!): Category
        deleteCategory(id: ID!): Category  
        updateCategory(category: updateCategoryInput!): Category
    }

`;
export default schema; 
