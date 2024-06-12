const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id)

    if(!document){
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
        status : 'success',
        data : null
    })
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new : true, //If not set new to true, then after updation, it will again return old value
        runValidators : true //Runs validation on updated values
    })

    if(!document){
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status : 'success',
        data : {
            data : document
        }
    })
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body)
    res.status(201).json({
        status : 'success',
        data : {
            data : newDocument
        }
    })
});

exports.getOne = (Model, populateWith) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    // We'll check if we're populating query with something, if yes add populate to the query. If no, we'll simply await for results.
    if(populateWith) query = query.populate(populateWith);
    const document = await query;
    
    if(!document){
         return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
         status : 'success',
         data : {
            data : document
        }
    })
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tours. This is a small hack for all reviews on a tour.
    let filter = {};
    if(req.params.tourID) filter = { tour : req.params.tourID }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const documents = await features.query.explain(); To get the statistics about the query
    const documents = await features.query
    

    // SEND RESPONSE
    res.status(200).json({
        status : 'success',
        results : documents.length,
        data : {
            data : documents
        }
    })

})