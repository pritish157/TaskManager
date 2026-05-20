// Wraps an async function so any error is automatically caught
// and passed to Express error handling (next(err)).
// Without this, you'd need try-catch in every controller.
//
// Usage: asyncHandler(myControllerFunction)

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export default asyncHandler;
