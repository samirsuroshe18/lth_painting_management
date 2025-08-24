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
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 5,                   // Maximum 5 files
    fieldSize: 2 * 1024 * 1024, // 2MB field size limit
    fieldNameSize: 100,         // 100 bytes field name limit
    headerPairs: 2000          // Maximum header pairs
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type validation
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
  }
});