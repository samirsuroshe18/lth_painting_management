import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-7xl font-bold text-blue-600">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">Oops! Page Not Found</h2>
      <p className="text-gray-600 mt-2 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved. Try going back to the homepage.
      </p>
      
      <img
        src="https://cdn.dribbble.com/users/285475/screenshots/2083086/media/a1524314b3e7abc07c7ef5e5c74a77dc.gif"
        alt="Not Found Illustration"
        className="w-80 mt-6"
      />

      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
