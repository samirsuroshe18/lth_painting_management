import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";

const verifyAdmin = catchAsync(async (req, _, next) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "You are not admin.");
    }

    req.admin = req.user;
    next();
});

export { verifyAdmin };