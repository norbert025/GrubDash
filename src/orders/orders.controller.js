const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// Done: Middleware function
function fieldRequired( request, response, next ) {
  const { data: { status, dishes,mobileNumber, deliverTo } = {} } = request.body;
  const data = request.body.data || {};
  const mustInclude = ["deliverTo", "mobileNumber", "dishes"];

  for (const i of mustInclude) {
  if (!data[i]) {
      next({
        status: 400,
        message: `Order must include a ${i}`,
      });
    }
  }
  next();
}

// Done: Middleware function
function dishesValid( request, response, next ) {
  const dishes = request.body.data.dishes || {};
  // Done: Checks if dishes exists and is defined

  if ( dishes.length == 0 || !Array.isArray(dishes) ) {
    next({
      status: 400,
      message: "dish",
    });
  }

  for ( let i = 0; i < dishes.length; i++)  {
    const dish = dishes[i];
    if (
       dish.quantity <= 0 ||
      !Number.isInteger(dish.quantity) ||
      !dish.quantity 
     
      
     ) {
      next( {
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      } );
    }
  }
  next();
}

function orderExists( request, response, next ) {
  const orderId = request.params.orderId;
  const order = orders.find((order) => order.id === orderId);
  if ( order ) {
    response.locals.order = order; 
    next();
  } else {
    next( {
      status: 404,
      message: `Order doesn't exist: ${orderId}`,
    } );
  }
}

function statusValid( request, response, next ) {
  const status = request.body.data.status || {};
  const validOrder = ["pending", "preparing", "out-for-delivery"];
  if (!status || status === "" || !validOrder.includes(status)) {
    next( {
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    } );
  }
// Deliverd response
  if ( status === "delivered" ) {
    next( {
      status: 400,
      message: "A delivered order cannot be changed",
    } );
  }
  next();
}

// Done: Middleware function
// Done: Checks if order Id in route and request body match
function matchOrderId( request, response, next ) {
  const order = request.params.orderId;
  const id = request.body.data.id;
  if ( order !== id && id ) {
    next( {
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${order}.`,
    } );
  }
  next();
}

// Done: Middleware function
// Done: Only pending orders can be deleted
function pendingStatus(request, response, next) {
  const order = response.locals.order;

  // pending response
  if ( order.status === "pending" ) {
    next();
  }
  next( {
    status: 400,
    message: "An order cannot be deleted unless it is pending",
  } );
}

function list( req, res ) {
  res.json({ data: orders });
}

// Done: read the profile
function read( request, response ) {
  response.json({ data: response.locals.order });
}

// Done: delete the profile
function destroy( request, response ) {
  response.sendStatus(204);
  orders.splice(orders.indexOf(response.locals.order), 1);
}

// Done:  create the profile
function create( request, response )  {
  const { data: { status, deliverTo, mobileNumber, dishes } = {} } = request.body;
  const order = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  response.status( 201 ).json({ data: order });
  orders.push( order );
  
}

// Done: update the profile
function update(request, response) {
  const order = response.locals.order;
  const { data: { status, deliverTo, mobileNumber, dishes } = {} } = request.body;
  order.status = status;
  order.deliverTo = deliverTo;
  order.dishes = dishes;
  order.mobileNumber = mobileNumber;
  response.json({ data: order });
}

module.exports = {
  list,
  create: [ fieldRequired, dishesValid, create ],
  read: [ orderExists, read ],
  update: [
     orderExists,
     matchOrderId,
     fieldRequired,
     dishesValid,
     statusValid,
     update,
   ],
  destroy: [ orderExists, pendingStatus, destroy ],
};
