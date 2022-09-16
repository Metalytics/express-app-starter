const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {MongoClient} = require('mongodb')
const moment =require('moment')

exports.getAllCollection = catchAsync(async (req, res, next) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("collection")
    const collection = db.collection('collections');
    const data = await collection.find({
      '$or': [
        { 'registration_closes': { '$gte': moment.utc().toDate() } },
        { 'registration_closes': null },
      ],
      'registration_status': { '$in': ["open", "unknown"] },
    },
      {
        projection: { _id: 0 }
      }
    ).toArray()
    client.close()
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data)
  } catch (e) {
    console.log(e)
    return next(
      new AppError(`${e.message}`, 404)
    );
  }
});
