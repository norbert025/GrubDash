const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function requiredText( request, response, next ) {
  const { data: { name, description, price, image_url } = {} } = request.body;
  const data = request.body.data || {};
  const requiredText = ["name", "description", "price", "image_url"];

  for ( const i of requiredText ) {
    if (!data[i]) {
      next({
        status: 400,
        message: `Dish must include a ${i}`,
      });
    }
  }
  next();
}

// Done: list the profile
function list( request, response, next ) {
  response.json({ data: dishes });
}

// Done: read the profile
function read( request, response, next ) {
  response.status(200).json({ data: response.locals.hasDish });
}

// Done: create the profile
function create( request, response, next ) {
  const { data: { price, name, image_url, description } = {} } = request.body;

  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  dishes.push( newDish );
  response.status(201).json({ data: newDish });
}

// Done: update the profile
function update( request, response, next ) {
  const data = request.body.data || {};
  const { data: { id, price, name, image_url, description } = {} } =
    request.body;

  const dish = response.locals.hasDish;
  const mustInclude = ["name", "description", "price", "image_url"];

  for (const i of mustInclude) {
    if (data[i] !== dish[i]) {
      dish[i] = data[i];
    }
  }

  response.json( { data: dish } );
}

function hasDish( request, response, next ) {
  const dishId = request.params.dishId;
  const hasDish = dishes.find((dish) => dish.id === dishId);

  if ( hasDish ) {
    response.locals.hasDish = hasDish;
    next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

function BodyIdRouteIdMatch( request, response, next ) {
  const dishId = request.params.dishId;
  const { data: { id } = {} } = request.body;

  if ( dishId && id ) {
    if (dishId === id) {
      next();
    }

    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  next();
}

// checks price is grater than zero
function priceNotZero( request, response, next ) {
  const price = request.body.data.price || {};

  if (price <= 0) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  next();
}

function isANumber( request, response, next ) {
  const price = request.body.data.price || {};

  if ( typeof price !== "number" ) {
    next({
      status: 400,
      message: "Dish price is not a number",
    });
  }
  next();
}

module.exports = {
  list,
  create: [ requiredText, priceNotZero, create ],
  read: [ hasDish, read ] ,
  update: [
     hasDish,
     requiredText,
     isANumber,
     priceNotZero,
     BodyIdRouteIdMatch,
     update,
  ],
};
