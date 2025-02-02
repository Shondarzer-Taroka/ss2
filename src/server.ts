import app from "./app";
import dotenv from 'dotenv';
dotenv.config()
const PORT=  process.env.PORT || 4545
app.listen(PORT,()=>{
    console.log(`server is running in port ${PORT}`);
})