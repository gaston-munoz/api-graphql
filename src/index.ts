import 'reflect-metadata';
import signale from 'signale';
import dotenv from 'dotenv';
import  { ApolloServer } from 'apollo-server';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';
// import resolversCategory from './graphql/resolvers/categoryResolver';
// import typeDefsCategory from './graphql/schema/categorySchema';
import { connect } from './config/typeorm';
import jwt from 'jsonwebtoken';
dotenv.config({ path: '../.env'});
connect();
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const token: string = req.headers.authorization || '';

        try {
            const user = jwt.verify(token, process.env.SECRET || '')

            return  { user }
        } catch (error) {
            console.log(error.message);
        }
    }
});

// Starting the server

server.listen(5000)
    .then(({url}) => {
        signale.success(`Server listening on ${url}`);
    })