const authModel = require("../../../models/mobile/auth/authModel");
const { catchAsyncError } = require("../../../middelware/catchAsyncError.js");
const response = require("../../../utilities/responseMsg.js");
const responseCode = require("../../../utilities/responseCode.js");

exports.patientList = catchAsyncError(async (req, res) => {
    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;
    const status = req.query.status || "";

    console.log("status:",status);

    // Build match conditions
    const matchConditions = {};
    if (status && status.trim() !== "") {
        matchConditions.isActive = status === "true" ? true : false;
    }
    // Add search condition if search query exists
    if (search && search.trim() !== "") {
        const searchRegex = { $regex: search.trim(), $options: "i" };
        matchConditions.$or = [
            { fullName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { city: searchRegex },
            { country: searchRegex }
        ];
    }

    console.log("matchConditions:",matchConditions);

    // Aggregation pipeline with pagination and search
    const patients = await authModel.aggregate([
        {
            $match: matchConditions
        },
        {
            $facet: {
                // Get paginated data 
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 0,
                            id: { $toString: "$_id" },
                            fullName: 1,
                            email: 1,
                            phone: 1,
                            profilePicture: 1,
                            isActive: 1,
                            isVerified: 1,
                            stepCount: 1,
                            createdAt: 1,
                            updatedAt: 1    
                        }
                    }
                ],
                // Get total count for pagination
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    // Extract data and total count
    const patientList = patients[0].data;
    const totalCount = patients[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Response data
    const responseData = {
        patients: patientList,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        },
        search: search || null
    };

    return response.responseHandlerWithData(
        res,
        true,
        responseCode.SUCCESS,
        "Patients list fetched successfully",
        responseData
    );
});

exports.patientDetails = catchAsyncError(async (req, res) => {
    const patientId = req.params.id;
    console.log("patientId:",patientId);

    const patient = await authModel.findById({_id:patientId}).select("-password");f
   
    if (!patient) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.NOT_FOUND,
            "Patient not found"
        );
    }

    return response.responseHandlerWithData(
        res,
        true,
        responseCode.SUCCESS,
        "Patient details fetched successfully",
        { patient: patient }
    );
});