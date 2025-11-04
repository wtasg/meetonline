import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { getFormattedDate } from "../utils/date.js";

const uploadFolder = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${getFormattedDate()}_${file.originalname}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    cb(null, true);
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
