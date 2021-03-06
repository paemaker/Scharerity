import { generateToken, isAdmin, isAuth } from '../Utils.js';

import User from '../Models/UserModel.js';
import bcrypt from 'bcryptjs';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';

const Data = {
    users: [
        {
            fullname: 'Admin',
            email: 'admin@admin.com',
            password: bcrypt.hashSync('1234', 8),
            isAdmin: true,
            isGiver: true,
            giver: {
                username: 'admin',
                logo: 'none',
                description: 'Adminisrator',
                rating: 4.5,
                numReviews: 120,
            },
        },
    ]
}

const UserRouter = express.Router();

UserRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    const createUsers = await User.insertMany(Data.users);
    res.send({ createUsers });
}));

UserRouter.post('/login', expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if(user) {
        if(bcrypt.compareSync(req.body.password, user.password)) {
            res.send({
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                isAdmin: user.isAdmin,
                haveUsername: user.haveUsername,
                isGiver: user.isGiver,
                token: generateToken(user),
            });
            return;
        }
    }

    res.status(401).send({ message: 'อีเมลหรือรหัสผ่านผิด' });
}));

UserRouter.post('/register', expressAsyncHandler(async (req, res) => {
    const user = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    });
    const newUser = await user.save();
    res.send({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        haveUsername: user.haveUsername,
        isGiver: user.isGiver,
        token: generateToken(newUser),
    });
}));

UserRouter.get('/:id', expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if(user) {
        res.send(user);
    } else {
        res.status(404).send({ message: 'ไม่พบบัญชีผู้ใช้' });
    }
}));

UserRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if(user) {
        user.fullname = req.body.fullname || user.fullname;
        user.email = req.body.email || user.email;
        user.haveUsername = Boolean(req.body.haveUsername);
        if(user.isGiver) {
            user.giver.username = req.body.giverUsername || user.giver.username;
            user.giver.logo = req.body.giverLogo || user.giver.logo;
            user.giver.description = req.body.giverDescription || user.giver.description;
        }
        if(req.body.password) {
            user.password = bcrypt.hashSync(req.body.password, 8);
        }
        const updatedUser = await user.save();
        res.send({
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            haveUsername: user.haveUsername,
            isGiver: user.isGiver,
            token: generateToken(updatedUser),
        });
    };
}));

UserRouter.get('/', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.find({ });
    res.send(user);
}));

UserRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if(user) {
        if(user.email === 'admin@admin.com') {
            res.status(400).send({ message: 'ไม่สามารถลบบัญชีแอดมินได้' });
            return;
        }
        const deleteUser = await user.remove();
        res.send({ message: 'บัญชีผู้ใช้ถูกลบแล้ว', user: deleteUser });
    } else {
        res.status(404).send({ message: 'ไม่พบบัญชีผู้ใช้' });
    };
}));

UserRouter.put('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if(user) {
        user.fullname = req.body.fullname || user.fullname;
        user.email = req.body.email || user.email;
        user.isGiver = Boolean(req.body.isGiver);
        user.isAdmin = Boolean(req.body.isAdmin);

        const updatedUser = await user.save();
        res.send({ message: 'แก้ไขสถานะผู้ใช้เสร็จสิ้น', user: updatedUser });
    } else {
        res.status(404).send({ message: 'ไม่พบบัญชีผู้ใช้' });
    };
}));


export default UserRouter;
