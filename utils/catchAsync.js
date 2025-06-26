//? This is  a way of directly exporting the function that accepts the function (func) as a parameter
//? This is basically a wrapping function for async functions that catches their errors and pass to error handler.

module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};

// this is done to avoid manually doing try and catch on all ASYNC things in app.js.
// we can just encase all async functions inside thsi asyncCatch wrapper.

// * Why only async?
// Synchronous errors (like invalid operations or accessing undefined variables) are automatically caught by Express's default error-handling mechanism.
// Errors in async/await code are not automatically caught by Express error-handling middleware.
// That is why we have made only for async functions

// in app.js we did :
// const catchAsync = require("./utils/catchAsync");

// note : Gyaan ki baate

/*
! Explanation of the Code
    This code is a utility function for wrapping asynchronous functions in Express. It simplifies error handling for routes that use async/await by catching any rejected promises and passing the error to the next() function. This ensures that errors are properly handled by Express's error-handling middleware.

Breaking It Down
* 1. Module Export
    module.exports = (func) => {
        return (req, res, next) => {
            func(req, res, next).catch(next);
        };
    };
    ? Purpose:
    - This function is exported so it can be used across the application.
    - It wraps any asynchronous route handler or middleware function to automatically catch errors.
* 2. Parameters
    func:
    - The function being passed to the wrapper.
    - It's an asynchronous function (likely using async/await) that accepts the standard Express parameters: req, res, and next.
* 3. Returning a New Function
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };

    - The outer function returns a new function that Express can use as middleware or a route handler.
    ? Inside the returned function:
    - The original func is called with req, res, and next as arguments.
    - Any promise returned by func is handled with .catch(next), meaning if func throws an error or rejects a promise,the error is passed to Express's error-handling middleware via next().
    ? Why Use This?
    In Express, if an error occurs in an asynchronous route handler or middleware (e.g., with async/await), it won't automatically be caught and passed to the error-handling middleware. For example:

    ? Without the Wrapper:
    app.get('/example', async (req, res) => {
        const data = await someAsyncFunction(); // If this rejects, Express won't catch it
        res.send(data);
    });
    - If someAsyncFunction() throws an error, it won't be passed to Express's error-handling middleware unless you explicitly wrap the route in a try-catch block and call next().

    ? With the Wrapper:
    const asyncWrapper = require('./path/to/this/module');

    app.get('/example', asyncWrapper(async (req, res) => {
        const data = await someAsyncFunction(); // Errors are automatically caught
        res.send(data);
    }));
    - Now, if someAsyncFunction() rejects, the error is caught and passed to the next() function.
*/
