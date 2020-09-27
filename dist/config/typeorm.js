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
exports.connect = void 0;
require("reflect-metadata");
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const signale_1 = __importDefault(require("signale"));
dotenv_1.default.config();
exports.connect = () => __awaiter(void 0, void 0, void 0, function* () {
    yield typeorm_1.createConnection({
        type: 'postgres',
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        username: process.env.PG_USER,
        password: process.env.PG_PASS,
        database: process.env.PG_DATABASE,
        synchronize: true,
        ssl: {
            rejectUnauthorized: false
        },
        entities: [
            path_1.default.join(__dirname, 'entity/**.js')
        ],
    });
    signale_1.default.success("Cloud PostgreSQL DB connected");
});
