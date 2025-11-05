import { upload } from "../middlewares/uploadMiddleware.js";

function setupUploadHandler(app) {
    app.post("/api/upload", (req, res) => {
        upload.single("file")(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err.message,
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    ok: false,
                    error: "No file uploaded",
                });
            }

            return res.json({
                ok: true,
                message: "File uploaded successfully",
                file: {
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    filename: req.file.filename,
                    path: `/uploads/${req.file.filename}`,
                },
                body: req.body,
            });
        });
    });
}

export { setupUploadHandler };
