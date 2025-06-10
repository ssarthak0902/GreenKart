
import jwt from 'jsonwebtoken';

const authUser = async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success:false,message:"Not Authorized"});
    }
    try {
        const  tokenDecode = jwt.verify(token,process.env.JWT_SECRET)
        if(tokenDecode.id){
            req.userId = tokenDecode.id; ////
        }else{
            return res.json({success:false,message:"Not Authorized"});
        }
        next(); //exectue the controller function after token decoding
    } catch (error) {
            return res.json({success:false,message:error.message});
        
    }
}
export default authUser;