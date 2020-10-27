import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

const typesArray: any[] = fileLoader(path.join(__dirname, '../config/entities/**/type/type.*'));
const typeDefs =  mergeTypes(typesArray, { all: true });

const resolversArray: any[] = fileLoader(path.join(__dirname, '../config/entities/**/resolver/resolver.*'));
const resolvers =  mergeResolvers(resolversArray);

export { resolvers, typeDefs }

