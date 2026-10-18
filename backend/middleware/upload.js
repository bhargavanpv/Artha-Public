const multer = require('multer');

const storage = multer.memoryStorage();

const ALLOWED_TYPES = [
    'text/csv',
    'application/pdf',
    'application/vnd.ms-excel',                                          // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
];

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV, PDF, XLS, and XLSX files allowed'), false);
        }
    }
});

module.exports = upload;