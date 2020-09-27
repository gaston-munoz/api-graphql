import { gql } from 'apollo-server';

const typeDefs = gql`

    type Category {
        id: ID
        name: String
        userId: Int
    }

    input NewCategoryInput {
        name: String,
        userId: Int
    }


    type QueryCategory {
        categories: [Category] 
    }

    type MutationCategory {
        newCategory(input: NewCategoryInput!): Category 
    }


`;


export default typeDefs;