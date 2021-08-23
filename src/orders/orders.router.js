const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// router for :orderId
router
    .route( "/:orderId" )
    .get( controller.read )
    .put( controller.update )
    .delete( controller.destroy ) 
    .all( methodNotAllowed );

// router for /orders
router
    .route( "/" )
    .get( controller.list )
    .post( controller.create )
    .all( methodNotAllowed );

module.exports = router;