class ApiError extends Error {
    constructor(statusCode, message='Something went wrong', localFilePath=null){
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.localFilePath = localFilePath;
    }
}

export default ApiError 