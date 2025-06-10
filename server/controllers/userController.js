
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

//register user: /api/user/register
export const register = async(req,res)=>{
    try{
        const {name,email,password} = req.body;

        if(!name || !email || !password){
            return res.json({success:false,message:'Missing Detials'});
        }
        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.json({success:false,message:'User Already Exists'});
        }
        const hashedPassword =await bcrypt.hash(password,10)
        const user =await User.create({name,email,password:hashedPassword})

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly:true, //prevent  client-side Javascript to access cookie
            secure: process.env.NODE_ENV === 'production', //use secure cookie in production
            sameSite : process.env.NODE_ENV === 'production'?'none':'strict', //CSRF protection
            maxAge : 7*24*60*60*1000, //cookie expiration time

        })

        return res.json({success:true,user :{email:user.email,name:user.name}})

    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}
 //login function for existing user
//Login User: /api/user/login

export const login = async(req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.json({success:false,message:"Email and Password are required"})
        }
        const user = await User.findOne({email});

        if(!user){
            return res.json({success:false,message:"Invalid Email Or Password"})
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message:"Invalid Email Or Password"});
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly:true, //prevent  client-side Javascript to access cookie
            secure: process.env.NODE_ENV === 'production', //use secure cookie in production
            //secure: true, //use secure cookie in production
            sameSite : process.env.NODE_ENV === 'production'?'none':'strict', //CSRF protection
            //sameSite :'None' ,//CSRF protection

            maxAge : 7*24*60*60*1000, //cookie expiration time

        })

        return res.json({success:true,user :{email:user.email,name:user.name}})

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

//check Auth: /api/user/is-auth
//check whether user authenticated or not and get user data
export const isAuth = async (req,res)=>{
    try {
        const userId=req.userId;
        const user = await User.findById(userId).select("-password");
        return res.json({success:true,user});
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
        
    }
}

//Logout User: /api/user/logout

export const logout = async(req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production', //use secure cookie in production //process.env.NODE_ENV === 'production'
            sameSite :process.env.NODE_ENV === 'production'?'none':'strict', //CSRF protection //process.env.NODE_ENV === 'production'?'none':'strict'
        })
        res.json({success:true,message:"Logged Out"});
        return 
    } catch (error) {
        console.log(error.message);
        return res.json({success:false,message:error.message});
    }
}