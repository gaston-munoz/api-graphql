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
exports.generateToken = exports.authenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.authenticated = (next) => (root, args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.user) {
        throw new Error('Not authorized to access this resource');
    }
    return yield next(root, args, ctx, info);
});
exports.generateToken = (user, secret, expiresIn) => {
    let { id, name, email } = user;
    return jsonwebtoken_1.default.sign({ id, name, email }, secret, { expiresIn });
};
