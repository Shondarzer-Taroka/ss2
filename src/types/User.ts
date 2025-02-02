// // src/types/User.ts

export interface User {
    id?: number;  // Make 'id' optional since it's auto-generated
    name: string;
    username: string;
    email: string;
    photo?: string;
    role: string;
    mobileNumber?: string;
    password: string;
}
