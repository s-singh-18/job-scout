// module.exports = (func) => (req, res, next) => 
//     Promise.resolve(func(req, res, next))
//         .catch(next);


module.exports = function(func) {
    // Return an Express middleware function that uses req, res, next
    return function(req, res, next) {
        // Call func(req, res, next) and wrap it in a Promise
        Promise.resolve(func(req, res, next))
            .catch(next); // Pass any error to next()
    };
};


// This code exports a higher-order function that acts as an error 
// handler for asynchronous functions in an Express.js application. 

// 1. module.exports: 
//    The code is being exported as a module so it can be reused in 
//    other parts of the application.

// 2. func => (req, res, next) => {...}: 
//    This is a function that takes a single argument "func" 
//    (an asynchronous function) and returns a new middleware 
//    function that takes the standard 'req, res, and next' arguments 
//    used in Express.

// 3. Promise.resolve(func(req, res, next)): 
//    This calls the passed-in function "func" with req, res, and next 
//    as arguments. 
//    Wrapping it in Promise.resolve() ensures that even if "func"
//    does not explicitly return a promise, it will be converted to 
//    one.

// 4. .catch(next): 
//    If an error occurs during the execution of "func", it will be 
//    caught here and passed to 'next', which is the error handler 
//    middleware in Express.

// * Purpose
//   This function wraps "func" to ensure any errors in asynchronous 
//   routes are caught and forwarded to the error-handling middleware, 
//   avoiding the need for "try-catch blocks" in each async route.