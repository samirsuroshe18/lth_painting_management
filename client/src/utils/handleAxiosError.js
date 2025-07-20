
const handleAxiosError = (err) => {
    if (err.response) {
        // Server responded with a status code outside the 2xx range
        return err.response.data.message || "Something went wrong on the server.";
    } else if (err.request) {
        // Request was made, but no response was received
        return "Unable to connect to the server. Please check your connection.";
    } else {
        // Error occurred in setting up the request or something unexpected happened
        return err.message || "An unexpected error occurred. Please try again.";
    }
}

export {handleAxiosError};
