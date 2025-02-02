import {Router} from 'express';
import { loginUser, registerUser } from '../controllers/userController';
const router=Router()


router
.post('/user',registerUser)
.post('/login',loginUser)


export default router