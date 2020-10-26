"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const signale_1 = __importDefault(require("signale"));
const dotenv_1 = __importDefault(require("dotenv"));
const apollo_server_1 = require("apollo-server");
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const schema_1 = __importDefault(require("./graphql/schema"));
const typeorm_1 = require("./config/typeorm");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config({ path: '../.env' });
typeorm_1.connect();
const server = new apollo_server_1.ApolloServer({
    typeDefs: schema_1.default,
    resolvers: resolvers_1.default,
    introspection: true,
    playground: true,
    context: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let token = null;
        let user = null;
        try {
            token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (token)
                user = jsonwebtoken_1.default.verify(token, process.env.SECRET || '');
        }
        catch (error) {
            console.log(error.message);
        }
        return { user };
    })
});
// POrt
const port = process.env.PORT || 4000;
// Starting the server
server.listen(port)
    .then(({ url }) => {
    signale_1.default.success(`Server listening on ${url}`);
});
