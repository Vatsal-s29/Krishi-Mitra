class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;

// note : Gyaan ki Baate

/*
? 1. class ExpressError extends Error
    * Error class: 
    The built-in Error class in JavaScript provides basic error properties like message and a stack trace.
    * extends: 
    The extends keyword allows ExpressError to inherit from Error, meaning it will have all the features of the Error class.
    * Purpose: 
    By extending Error, the ExpressError class can act as an error object while adding custom properties (statusCode) that are useful for an Express application.
? 2. Constructor Function
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
* - constructor:
    A special method used to initialize a new object created from the class.
* - Parameters:
    - message: The error message that will be displayed.
    - statusCode: The HTTP status code associated with this error (e.g., 404 for "Not Found," 500 for "Internal Server Error").
    - super(): Calls the constructor of the parent class (Error) to initialize properties like the stack trace. Without this, the Error behavior would not be correctly set up.
* - Custom Properties:
    - this.message: Assigns the provided message to the instance.
    - this.statusCode: Adds a statusCode property to the error instance, making it easy to identify and handle HTTP errors.
*/
