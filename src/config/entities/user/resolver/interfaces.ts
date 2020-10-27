export interface ArgUser {
    user: IUserModel
}

export interface UserID {
    id: number
}

export type DBUser =  IUserModel | undefined

export interface UserUpt {
    user: IUserUpd
}

export interface IUserUpd {
    id: number,
    name?: string,
    email?: string,
    password?: string,
    createdAt?: string
}

export interface IUserModel {
    id?: number,
    name?: string,
    email: string,
    password: string,
    createdAt?: string
}

export interface UserLogin {
    user: IUserModel
}

export interface Token {
    token: string
}