const Route =
require('../models/route.model');


// CREATE ROUTE
exports.createRoute =
async (req, res) => {

try {

const {
name,
stops
}
=
req.body;

const route =
await Route.create({

name,

stops

});

res
.status(201)
.json(route);

}

catch(error){

res
.status(500)
.json({
message:
error.message
});

}

};


// GET ROUTES
exports.getRoutes =
async (req, res) => {

try {

const routes =
await Route
.find()
.populate('stops');

res
.json(routes);

}

catch(error){

res
.status(500)
.json({
message:
error.message
});

}

};