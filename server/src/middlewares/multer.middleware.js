import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();  // Generate a unique suffix using timestamp
    const extension = file.originalname.split('.').pop();  // Get the file extension
    const baseName = file.originalname.split('.').slice(0, -1).join('.'); // Get the original file name without the extension

    cb(null, `${baseName}-${uniqueSuffix}.${extension}`);  // Append the unique suffix to the file name
  }
})

export const upload = multer({ storage, });
// export const upload = multer({ storage : storage });