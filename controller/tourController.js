/* eslint-disable prefer-object-spread */
// const fs = require('fs') //Was required for reading file from data
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

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

exports.uploadTourImages = upload.fields([
    {name : 'imageCover', maxCount : 1}, //This means we can only have one field with name imageCover
    {name : 'images', maxCount : 3}
]);

exports.resizeTourImages = catchAsync(async(req, res, next) => {
    // In case of multiple files, we write req.files and req.file
    // console.log(req.files);

    // If no images uploaded, move to the next middleware in stack
    if(!req.files.imageCover || !req.files.images) return next();

    // 1) Cover Image
    // This route will always contain the id of tour so req.params
    const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg` 

    // The stored image is on buffer as mentioned in multerStorage
    // Having it on buffer is more efficient than having it on disk and then reading it here.
    // Calling a sharp function like this will create an object on which we can chain multiple methods
    
    // toFile will write the image to the disk which needs an entire path 
    // imageCover is an array of one element
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)  //resize to a 3:2 ratio
        .toFormat('jpeg')  // We are further defining the quality of image, to compress it a little bit, to 90%
        .jpeg({ quality : 90 })
        .toFile(`public/img/tours/${imageCoverFileName}`);

    // Putting it on req.body because in updateOne in handleFactory, it is updating all the data present on req.body
    // It is(they probably don't have to be same) imageCover because that is the name we have in our schema definition, and so when it's doing the update, it will match this field in the body with the field in our database
    req.body.imageCover = imageCoverFileName;

    // 2) Images
    req.body.images = [];
    // We are using a map and not forEach as then even though async await is running on the callback the code will not wait and move on to the next line of code which is next()
    // We can await it on map as async will return an array of promises which can be awaited on using promise.all
    // If we don't await req.body.images will likely be empty.
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
        
        await sharp(file.buffer)
            .resize(2000, 1333)  
            .toFormat('jpeg')
            .jpeg({ quality : 90 })
            .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
    }));
    // console.log(req.body);
    next();
});

// When there's only one field we would've used upload.single('fieldname)
// If we didn't need imageCover, we would've written as - upload.array('images', 5)

exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()
}

/* These were required when working with the file that contained data. When interacting with a database, they are not needed.
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
) // {../ gets out of routes folder}

exports.checkID = (req, res, next, value) => {
    console.log(`The Tour id is : ${value}`) //value parameter will hold the value for id
    const id = req.params.id * 1 //Will convert id from string into int.
    if(id > tours.length) {
        return res.status(404).json({
            status : 'fail',
            Message : 'Invalid ID'
        })
    }
    next()
}

exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price) {
        return res.status(400).json({
            status : 'fail',
            Message : 'Missing name or price'
        })
    }
    next()
} */

exports.getAllTours = factory.getAll(Tour);
/* exports.getAllTours = catchAsync(async (req, res, next) => {
        //BUILD QUERY
        // 1) FILTERING
        // const queryObj = { ...req.query }
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // excludedFields.forEach(el => delete queryObj[el] ); //For each element in excluded fields, it deletes from queryObj if property present in queryObj

        // console.log(req.query, queryObj)
        
        // 1B) ADVANCED FILTERING

        // let queryStr = JSON.stringify(queryObj)
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // console.log(JSON.parse(queryStr)) //Replaced the exact characters in regular expression by the same but with $ in prefix
        // // In MongoDB - db.tours.find( { difficulty : 'easy', duration : { $gte : 5 } } )
        // // In result returned by req.query & queryObj - { difficulty: 'easy', duration: { gte: '5' } }
        // let query = Tour.find(JSON.parse(queryStr)) //Using queryStr which is equal to queryObj but replaces characters for advanced filtering. queryObj doesn't contain the excluded fields.

        // Another method
        // const query = await Tour.find()
        // .where('duration').equals(5)
        // .where('difficulty').equals('easy')
        
        // 2) SORTING (In sorting and field limiting - separate the sort and limiting fields by space and then work on them accordingly)
        // if(req.query.sort) {
        //     console.log("Query sort :", req.query.sort)
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log("Sort By :", sortBy)
        //     query = query.sort(sortBy) //By default ascending order, if you want descending then instead of price write -price.
        // }else {
        //     query = query.sort("-createdAt"); //If no sort criteria mentioned, then by default sort items by latest new tours
        // }

        // 3) FIELD LIMITING
        // if(req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else{
        //     query = query.select("-__v")
        // }

        // 4) PAGINATION
        // const page = req.query.page * 1 || 1; //By writing || 1, we set the default value of page to 1
        // const limit = req.query.limit * 1 || 100; //By multiplying by 1, we convert string value to Number
        // const skip = (page - 1) * limit;

        // // Suppose there are 10 pages with 10 items on each page - 1 to 10 on page 1, 11 to 20 on page 2, 21 to 30 on page 3, etc
        // // To request page 3, we have to have items starting at 21.
        // // So in above logic, if user requests page 3 -> (3-1) * 10 -> 2*10 -> 20. It will skip 20 items.

        // query = query.skip(skip).limit(limit);

        // if(req.query.page){ //This checks if request query contains page or not. If yes, only then the following will be executed.
        //     const numTours = await Tour.countDocuments(); //If we are skipping more items than there are documents present or equal to them, then it means the page user is requesting doesn't have any items to display
        //     if (skip >= numTours) throw new Error('This page does not exist')
        // }

        // EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;
        

        // SEND RESPONSE
        res.status(200).json({
            status : 'success',
            results : tours.length,
            data : {
                tours
            }
        })

}) */

exports.getTourById = factory.getOne(Tour, { path : 'reviews' }); //passing reviews as the field which we want to populate
// exports.getTourById = catchAsync(async (req, res, next) => {
//         const tour = await Tour.findById(req.params.id) .populate('reviews');
//         //The above is same as Tour.findOne({ _id : req.params.id }) minus the populate.
    
//         if(!tour){
//             return next(new AppError('No tour found with that ID', 404));
//         }

//         res.status(200).json({
//             status : 'success',
//             data : {
//                 tour
//             }
//         })
// })

/* This was used for file system
exports.postTour = (req, res) => {
    console.log(req.body)
    Id starts from 0. So, if 9 tours ->  tours[9-1].id + 1 -> tours[8].id + 1 -> 8 + 1 = 9 (10 tours in total)
    const newID = tours[tours.length - 1].id + 1 
    const newTour = Object.assign({id : newID}, req.body)

    tours.push(newTour)

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours) , err => {
        res.status(201).json({
            status : 'success',
            data : {
                Tour : newTour
            }
        })
    })
} */

exports.postTour = factory.createOne(Tour);
// exports.postTour = catchAsync(async (req, res, next) => {
//         //const newTour = new Tour({})
//         // newTour.save

//         // Another method. create returns promise like save
//         const newTour = await Tour.create(req.body)
//         res.status(201).json({
//             status : 'success',
//             data : {
//                 Tour : newTour
//             }
//         })
// })

exports.updateTour = factory.updateOne(Tour); //This will return a function which will be called when we hit the particular route
// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new : true, //If not set new to true, then after updation, it will again return old value
//         runValidators : true //Runs validation on updated values
//     })

//     if(!tour){
//         return next(new AppError('No tour found with that ID', 404));
//     }

//     res.status(200).json({
//         status : 'success',
//         data : {
//             tour
//         }
//     })
// })

exports.deleteTour = factory.deleteOne(Tour); //This will return a function which will be called when we hit the particular route
// exports.deleteTour = catchAsync(async (req, res, next) => {
//         const tour = await Tour.findByIdAndDelete(req.params.id)

//         if(!tour){
//             return next(new AppError('No tour found with that ID', 404));
//         }

//         res.status(204).json({
//             status : 'success',
//             data : null
//         })
// })

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match : {ratingsAverage : { $gte : 4.5 }}
        },
        {
            $group : { 
                _id : { $toUpper : '$difficulty'}, //Shows the field in uppercase
                numTours : { $sum : 1}, //For each of the document, one will be added to numTours
                numRatings : { $sum : '$ratingsQuantity'},
                avgRating : { $avg : '$ratingsAverage' }, 
                avgPrice : { $avg : '$price' },
                minPrice : { $min : '$price' },
                maxPrice : { $max : '$price' }
            }
        },
        {
            $sort : {
                avgPrice : -1 //1 for ascending order. We need to use the name of fields we defined in $group. If used original field names, there won't be an error but it won't probably be sorted either. 
            }
        },
        // {
        //     $match : { _id : { $ne : 'EASY'} } //ne means not equal to
        // }
    ])

    res.status(200).json({
        status : 'success',
        data : {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind : '$startDates' //Deconstructs the startDates array. It contains an array of start dates for each document. $unwind will deconstruct the startDates array, meaning for each element in the startDates array it will display the document for that element.
            },
            {
                $match : {
                    startDates : {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group : {
                    _id : { $month : '$startDates'},
                    numTourStarts : { $sum : 1 },
                    tours : { $push : '$name'} //pushing the name of tour documents into tours array
                }
            },
            {
                $addFields : { month : '$_id' } //Setting a new field with name 'month' equal to _id from above
            },
            {
                $project : {
                    _id : 0 //0 means don't show to user
                }
            },
            {
                $sort : { numTourStarts : -1 } //-1 means descending order
            },
            // {
            //     $limit : 2 //Will show only 2 documents
            // }

        ])

        res.status(200).json({
            status : 'success',
            data : {
                plan
            }
        }) 
});

// Reference - /tours-within/:distance/center/:latlng/unit/:unit
// lat and lng in format - 34.306389, -118.841641
exports.getToursWithin = catchAsync(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [ lat, lng ] = latlng.split(',');

    // radius is to search for tours within a certain radius but converted to special unit called radians
    // To get unit in radians we need to divide distance by the radius of earth.
    const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1; //The two numbers are radius of earth in miles and kilometer

    if(!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400))
    }

    // startLocation holds geospatial points where each tour starts
    // geoWithin finds documents within a certain geometry
    // We want to find documents at 'latlng' within a sphere of distance which is 'distance'
    // So if you are in los angeles(latlng) and want to find tours within 200 miles(distance)
    const tours = await Tour.find({ 
        startLocation : { $geoWithin : { $centerSphere : [ [lng, lat], radius ] } } //In geoJSON, longitude comes first
    });

    res.status(200).json({
        status : 'success',
        results : tours.length,
        data : {
            data : tours
        }
    });
});

exports.getDistances = catchAsync(async(req, res, next) => {
    const { latlng, unit } = req.params;
    const [ lat, lng ] = latlng.split(',');

    //To convert distance into kilometer or meter by multiplying by the specified numbers in ternary operator
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng) {
        return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400))
    }

    // geoNear near needs to be the first stage in geospatial aggregation, if not there will be an error.
    // The aggregation middleware in tourModels has currently been commented to make this work.
    const distances = await Tour.aggregate([
        {
            // geoNear is the only geospatial aggregation pipeline stage that exists and it always need to be the first one in pipeline
            // geoNear requires atleast one of our fields contains geospatial index. We already have startLocations as geospatial index.
            // If there's only one field with geospatial index then geoNear will automatically use that index to perform the calculation
            // But if you multiple fields with geospatial indexes then you need to use keys parameter in order to define the field that you want to use for calculations
            $geoNear : {
                //The point from which we will calculate distances of all tours. This is the point that we pass into the function - latlng
                near : { //Need to specify it as geoJSON
                    type : 'Point',
                    coordinates : [lng * 1, lat * 1] //*1 to convert them to number. longitude always the first.
                },
                // Default calculated distance is in meters
                distanceField : 'distance', //This will be the name of field that will be created where all calculates distances will be stored
                // To convert the distance(meters) into kilometers we need to divide it by 1000, but we can also get the same result by multiplying it with 0.001
                distanceMultiplier : multiplier //Here we specify a number which is going to be muliplied with all distances
            },
        },
        {
            $project : {
                distance : 1, //Fields that we want to display
                name : 1
            }
        }
        
    ]);

    res.status(200).json({
        status : 'success',
        data : {
            data : distances
        }
    });
});