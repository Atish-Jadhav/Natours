const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => { //has access to current request, to the currently uploaded file and to a callback function
//         cb(null, 'public/img/users'); //First argument is an error if there is a one and second argument is destination
//     },
//     filename: (req, file, cb) => {
//         // user-id-timestamp.jpeg. This makes such that every image will be unique.
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//     }
// });

const multerStorage = multer.memoryStorage(); //This way the image will be stored as buffer

const multerFilter = (req, file, cb) => {
    // The goal of this function is to check whether the uploaded file is an image
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    }else{
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
}

// Configuring Multer
const upload = multer({
    // dest : 'public/img/users' //Without this the images would've been stored on memory and not on disk
    storage: multerStorage,
    fileFilter: multerFilter
});

// single because we only want to upload one single image and into single we are going to pass the name of the field that is going to hold the image to upload
// This upload middleware will take care of taking the file and basically copying it to the destination that we specified and then afer that, it will call the next middleware.
// Also, the upload middleware will put the file or some information about the file on the request object
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    // If no file was uploaded
    if(!req.file) return next();
    // We need filename on req.file as it is later used in updateMe
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    // The stored image is on buffer as mentioned in multerStorage
    // Having it on buffer is more efficient than having it on disk and then reading it here.
    // Calling a sharp function like this will create an object on which we can chain multiple methods
    
    // toFile will write the image to the disk which needs an entire path 
    await sharp(req.file.buffer)
        .resize(500, 500)  //resize will create a square image as height is equal to width
        .toFormat('jpeg')  // We are further defining the quality of image, to compress it a little bit, to 90%
        .jpeg({ quality : 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el))
            newObj[el] = obj[el]; //We create the same key-value pairs in newObj but only for those keys which are mentione in allowedFields
    });
    // console.log(newObj);
    return newObj;
}

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async(req, res, next) => {
//     const users = await User.find();
    
//     res.status(200).json({
//         status : 'success',
//         results : users.length,
//         data : {
//             users
//         }
//     })
// })

exports.getMe = (req, res, next) => {
    // We are going to factory handler's getOne function but it requires id parameter. So the below workaround.
    req.params.id = req.user.id; //Getting currently logged in user from protect middleware
    next(); //It will be passed to user controller's getUserById
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user posts password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for updating password. Please use /updateMyPassword', 400));
    }

    // 2) Filtering out the unwanted fields that are not allowed to be updated.
    
    // The below method is suitable as we are not dealing with sensitive data like password.
    const filteredBody = filterObj(req.body, 'name', 'email');
    // photo is the field that holds the photo
    if(req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document

    // We won't be using .save() method here. For it would require saving all the required fields and we are not saving password here
    // const user = await User.findById(req.user.id);
    // user.name = req.body.name;
    // await user.save();

    // We won't directly be specifying req.body in findByIdAndUpdate because then user could try to change their other properties. Like their 'role'.
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new : true, //Returns the updated object
        runValidators : true
    });

    res.status(200).json({
        status : "success",
        data : {
            user : updatedUser
        }
    });
})

exports.deleteMe = catchAsync(async(req, res, next) => {
    // We are not deleting users. Just setting them inactive, in case user wishes to reactivate his account.
    // The user data will still be in the database
    await User.findByIdAndUpdate(req.user.id, { active : false });

    res.status(204).json({
        status : 'success',
        data : null
    })
});

exports.postUser = (req, res) => {
    res.status(500).json({
        status : 'error',
        message : 'This route is not defined. Please use /signup instead.'
    })
}

exports.getUserById = factory.getOne(User);
exports.patchUser = factory.updateOne(User); //DO NOT CHANGE PASSWORDS WITH THIS!
exports.deleteUser = factory.deleteOne(User); //This will return a function which will be called when we hit the particular route