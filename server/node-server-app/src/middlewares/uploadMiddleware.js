import multer from "multer";
import path from "node:path";
import { getFormattedDate } from "../utils/date.js";
import { UPLOAD_DIR } from "../utils/fs.js";
import { sanitizeFilename } from "../utils/sanitize.js";

const allowedMimes = [
    "text/plain",
    "application/pdf",
    "image/bmp",
    "image/png",
    "image/jpeg",
    "image/webp",
];

const allowedExt = [
    ".txt",
    ".pdf",
    ".bmp",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        try {
            const cleaned = sanitizeFilename(file.originalname);
            cb(null, `${getFormattedDate()}_${cleaned}`);
        } catch (err) {
            cb(err, null);
        }
    },
});

const fileFilter = (req, file, cb) => {
    try {
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedMimes.includes(file.mimetype)) {
            return cb(new Error(`Invalid file type: ${file.mimetype}`), false);
        }

        if (!allowedExt.includes(ext)) {
            return cb(new Error(`Invalid file extension: ${ext}`), false);
        }
        
        cb(null, true);
    } catch (err) {
        cb(err, false);
    }
};

const limits = {
    fileSize: 5 * 1024 * 1024,
};

const upload = multer({
    storage,
    fileFilter,
    limits,
});

export { upload };
