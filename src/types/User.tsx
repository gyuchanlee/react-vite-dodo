export interface User {
    username: string;
    email: string;
    profile?: string;
    createdAt: string;
}

export interface UserRegisterFormData {
    email: string;
    username: string;
    password: string;
    profile?: string;
}