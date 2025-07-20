import fs from 'fs';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const localFilePath = err.localFilePath || null;

  if (localFilePath && fs.existsSync(localFilePath)) {
    try {
      fs.unlinkSync(localFilePath); 
    } catch (fsErr) {
      console.error('Failed to delete local file:', fsErr);
    }
  }

  return res.status(statusCode).json({
    statusCode,
    message
  });
};