const express=require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const  { authMiddleware } = require("../middleware");
const{comparePassword, hashPassword}=require("../bcrypt");


const {Model,Account} =require("../db");


const router=express.Router();

const signupBody = zod.object({
    username: zod.string(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string()
})


router.post("/signup", async (req, res) => {
    try {
        const { success } = signupBody.safeParse(req.body)
        if (!success) {
           res.status(411).json({
                error: " Incorrect inputs"
            })
            return
        }

        const existingUser = await Model.findOne({
            username: req.body.username
        })
        if (existingUser) {
            res.status(411).json({
                error: " already taken"
            })
            return
        }
        const user = await Model.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username, 
            password: req.body.password
         
        })
        const userId = user._id;

        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        })

        const token = jwt.sign({
            userId
        }, JWT_SECRET);

        res.json({
            message: "User created successfully",
            token: token
        })
  
}
  catch (error) {
        console.log(error);
    }
})

const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})


router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            error: "Email already taken / Incorrect inputs"
        })
    }

    const user = await Model.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }   res.status(411).json({
        message: "Error while logging in"
    })
})

const updateBody=zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/",authMiddleware,async(req,res)=>{
    const {success}=updateBody.safeParse(req.body)
   if(!success){
    res.status(411).json({
        message:"error updating"
    })

   }

await User.updateOne(req.body,{
    id:req.userId
})

res.json({
    message:"updated"
})
})

router.get("/bulk",async(req,res)=>{
  const filter=req.query.filter || "";

  const users=await Model.find({
$or:[{
    firstName:{
        "$regex":filter
    }
},{
    lastName:{
        "$regex":filter
    }
}]

  })

  res.json({
    user:users.map(user=>({
        username:user.username,
        firstName:user.firstName,
        lastName:user.lastName,
        _id:user._id
    }))
  })
})

router.get("/info", authMiddleware, async (req, res) => {
    try {
      const user = await Model.findOne({ _id: req.userId });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ firstName: user.firstName });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
module.exports=router;