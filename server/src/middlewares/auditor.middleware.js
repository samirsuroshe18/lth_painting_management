import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";

const verifyAuditor = catchAsync(async (req, _, next) => {
    if (req.user.role !== 'technician') {
        throw new ApiError(403, "You are not a technician.");
    }

    req.auditor = req.user;
    next();
});

export { verifyAuditor };