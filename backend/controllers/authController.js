const Transaction = require('../models/Transaction');
const Category = require('../models/category');
const Feedback = require('../models/Feedback');

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Update profile — name, password, balance mode/amount
const updateProfile = async (req, res) => {
    try {
        const { name, password, manualBalance, balanceSetDate, hasSetBalance } = req.body

        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        if (name && name.trim()) user.name = name.trim()

        if (password) {
            if (password.length < 6)
                return res.status(400).json({ message: 'Password must be at least 6 characters' })
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
        }

        if (manualBalance !== undefined) user.manualBalance = Number(manualBalance)
        if (balanceSetDate) user.balanceSetDate = new Date(balanceSetDate)
        if (hasSetBalance !== undefined) user.hasSetBalance = hasSetBalance

        await user.save()

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                manualBalance: user.manualBalance,
                hasSetBalance: user.hasSetBalance,
                balanceSetDate: user.balanceSetDate,
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const register = async(req, res) =>{
    const { name, email, password } = req.body;

    //check if registering user EXIST in the Database

    if( !name ) return res.status(400).json({message:"Kindly enter your name :) "})
    if( !email ) return res.status(400).json({message:"Kindly enter your E-Mail :) "})
    if( !password ) return res.status(400).json({message:"Kindly enter your Password :o "})


    try {
        const existingUser = await User.findOne({email});
        if( existingUser ){
            return res.status(400).json(
                {
                    message : 'User already exists'
                }
            )
        }
    

    //if not, secure their password using bcrypt
    //considet salt in below as a function that scrambles the password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt)

        // User.create takes the data and validates with schema
        // in User.js and saves a new document (or a new row of user) 
        // in MongoDB

        const user = await User.create(
            {
                name,
                email,
                password : hashedPassword
            }
        )

        const seedCategories = require("../utils/seedCategories");
        await seedCategories(user._id); // Seed default categories for the new user 

        //Step-4 : generate JWT Token and response back

        const token = jwt.sign(
            { id : user._id},
            process.env.JWT_SECRET,
            {expiresIn : '7d'}
        );

        //set status of response
        res.status(201).json({
            token,
            user : {id : user._id, name : user.name, email : user.email}
        });

    }
    
    catch(error){
        res.status(500).json(
            {
                message : error.message
            }
        )
    }

    
}

//-----------------------------------Login----------------------------------------
    // finally, we will implement the login functionality. 
    // This function will check if the user exists, 
    // verify the password, and generate a JWT token 
    // for authenticated users.

const login = async(req, res) =>{

    const {email, password} = req.body;

    try{
        
        if(!email || !password){
            return res.status(400).json({message: "Kindly enter all fields"})
        } 

        let userFound = await User.findOne({email});
        
        if(!userFound){
            return res.status(400).json({message :"User don't exist - signup !"});
        }

        //now we need to compare password;

        const isMatch = await bcrypt.compare(password,userFound.password)

        if(isMatch){
            const token = jwt.sign(
                {
                    id : userFound._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn : '7d'
                }
            );
            
            res.status(200).json({
                message :`USER FOUND!!, Welcome ${userFound.name}`,
                token,
                user :{ 
                    id : userFound._id,
                    name : userFound.name, 
                    email : userFound.email}
            })
        }
        else{
            res.status(400).json({message : "Incorrect Email or Password"})
        }

        
    }
    catch (error){
        res.status(500).json({message : error.message});
    }

}

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        // If subscription is cancelled/halted AND period has expired, enforce free
        if (
            user.plan !== 'free' &&
            user.currentPeriodEnd &&
            new Date() > user.currentPeriodEnd &&
            user.subscriptionStatus !== 'active'
        ) {
            user.plan = 'free';
            user.subscriptionStatus = null;
            await user.save();
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteAccount = async(req, res) => {
    try{
        await Transaction.deleteMany({ user: req.user.id });
        await Category.deleteMany({ user: req.user.id });
        await Feedback.deleteMany({ userId: req.user.id });
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: "Account and all associated data deleted successfully." }); 
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}

const completedTour = async(req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {tourCompleted : true })
        res.json(200).json({message : "Tour marked complete"})
    }
    catch (err) {
        res.status(500).json({message : err.message})
    }
}

module.exports = { completedTour, updateProfile, register , login , getMe, deleteAccount};