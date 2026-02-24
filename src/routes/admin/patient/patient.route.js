const router = require("express").Router();
const { patientList, patientDetails } = require("../../../controllers/admin/patient/patient.controller.js");
const checkPermission = require("../../../middelware/checkPermission.middleware.js");
const verifyToken = require("../../../middelware/verifyToken.js");

router.use(verifyToken);

// router.use(checkPermission("view_patients", "view"));
router.get('/patient-list',patientList)

router.get('/patient-details/:id',patientDetails)

module.exports = router;