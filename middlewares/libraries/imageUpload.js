const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const CustomError = require("../../helpers/error/CustomError");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const rootDir = path.dirname(require.main.filename);
    cb(null, path.join(rootDir, "public/images"));
  },
  filename: function (req, file, cb) {
    const randomId = uuidv4();
    const extension = file.mimetype.split("/")[1];
    req.savedImages = req.savedImages || [];
    const savedImage =
      file.fieldname === "story_image"
        ? "story_" + randomId + "_" + req.user.id + "." + extension
        : file.fieldname === "post_image"
        ? "post_" + randomId + "_" + req.user.id + "." + extension
        : "user_" + randomId + "_" + req.user.id + "." + extension;
    req.savedImages.push(savedImage);
    cb(null, savedImage);
  },
});

const fileFilter = (req, file, cb) => {
  let allowedMimeTypes = ["image/jpg", "image/gif", "image/jpeg", "image/png"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new CustomError("Please provide a valid image file", 400), false);
  }
  return cb(null, true);
};

const imageUpload = multer({ storage, fileFilter });

module.exports = imageUpload;
