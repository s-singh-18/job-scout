class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message); // passing 'message' to the parent class constructor
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;


/*

# ErrorHandler Class Overview :-

- A custom error handler class named 'ErrorHandler' in JavaScript, 
  which is used to create custom error objects with additional 
  properties, like a status code, along with the error message.


* Definition:

- "ErrorHandler" extends the built-in 'Error' class, adding custom 
  properties for structured error handling.


* Constructor Parameters:

=> message: Error description.
=> statusCode: HTTP status code associated with the error.


* Key Methods:

=> super(message); : 
   Passes the error message to 'Error' class (parent).

=> this.statusCode = statusCode; : 
   Stores the status code in each instance.

=> Error.captureStackTrace(this, this.constructor); : 
   Cleans up the stack trace by excluding the constructor call, 
   making debugging easier.


* Purpose:

- Used in web applications to throw errors with both messages and 
  status codes, streamlining error handling and debugging.

*/