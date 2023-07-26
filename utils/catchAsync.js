///// ERROR CATCHING WRAPPER /////
module.exports = (fn) => {
  // returns anonymous function that calls a handler and catches
  // any errors that occur inside
  return (req, res, next) => fn(req, res, next).catch(next);
};
