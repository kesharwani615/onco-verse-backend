const router =  require("express").Router();

const mobileApiRoutes = require("./mobile/rootRoute");
const adminApiRoutes =  require("./admin/rootRoute");
const multiUpload = require("../middelware/multiUpload.middleware");
const uploadService = require("../services/upload.service");

router.use(mobileApiRoutes);
router.use(adminApiRoutes);

// upload routes
router.post(
    "/upload",
    multiUpload.array("files", 10),
    uploadService
);

module.exports=router;