const express = require("express");
const path = require("path");
const multer = require("multer");
const app = express();

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Statics setup
app.use("/public", express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Uploads is the Upload_folder_name
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		// cb(null, file.fieldname + "-" + Date.now() + ".jpg");
		cb(null, `${Date.now()}-${file.originalname}`);
	}
});

// Define the maximum size for uploading picture 
const maxSize = 1 * 1000 * 1000;

const upload = multer({
	storage: storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb) {
		// Set the filetypes, it is optional
		const filetypes = /jpeg|jpg|png/;
		const mimetype = filetypes.test(file.mimetype);

		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase()
		);

		if (mimetype && extname) {
			return cb(null, true);
		}

		cb(
			"Error: File upload only supports the " +
				"following filetypes - " +
				filetypes
		);
	}

	// mypic is the name of file attribute
}).array('pic-gallery');

app.get("/", function (req, res) {
	res.render("index");
});


app.post("/uploadPictureGallery", upload, (req, res) => {
    console.log(req.files); // Array of file objects
    const fileNames = req.files.map(file => file.filename).join(', ');
    res.send(`Uploaded ${req.files.length} files: ${fileNames}`);
	});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('File too large. Maximum size is 5MB.');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).send('Too many files uploaded.');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).send('Unexpected field name for file upload.');
    }
    // For any other Multer error
    return res.status(400).send(`Upload error: ${err.message}`);
  }

  // For non-Multer errors
  console.error(err);
  res.status(500).send('Something went wrong during file upload.');
});

app.listen(5000, function (error) {
	if (error) throw error;
	console.log("Server created Successfully on PORT 5000");
});
