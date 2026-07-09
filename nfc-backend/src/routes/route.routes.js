const express =
require('express');

const router =
express.Router();

const {
createRoute,
getRoutes
}
=
require(
'../controllers/route.controller'
);

const {
protect
}
=
require(
'../middleware/auth.middleware'
);

const {
authorize
}
=
require(
'../middleware/role.middleware'
);


// CREATE ROUTE
router.post(
'/',

protect,

authorize(
'admin'
),

createRoute
);


// GET ROUTES
router.get(
'/',

protect,

authorize(
'admin'
),

getRoutes
);

module.exports =
router;