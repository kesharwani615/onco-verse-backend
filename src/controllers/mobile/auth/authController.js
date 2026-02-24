const AuthModel = require("../../../models/mobile/auth/authModel.js");
const response = require("../../../utilities/responseMsg.js");
const responseCode = require("../../../utilities/responseCode.js");
const bcrypt = require("bcryptjs");
const { catchAsyncError } = require("../../../middelware/catchAsyncError.js");
const otpModel = require("../../../models/common/otp.model.js");
const service = require("../../../services/service.js");

// Register User -> using first send OTP and then verify OTP and then register user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { fullName, email, phone } = req.body;
 
  if (!fullName || !email || !phone) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.BAD_REQUEST,
      "Full name, email and phone are required"
    );
  }
 
  const formattedEmail = email.toLowerCase().trim();
  const trimmedName = fullName.trim();
 
  // Check if user already exists
  const existingUser = await AuthModel.findOne({
    $or: [{ email: formattedEmail }, { phone }],
  });
 
  if (existingUser) {
    if (existingUser.email === formattedEmail) {
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.CONFLICT,
        "User with this email already exists"
      );
    }
 
    if (existingUser.phone === phone) {
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.CONFLICT,
        "User with this phone number already exists"
      );
    }
  }
 
  // Delete old OTPs for this email & phone
  await otpModel.deleteMany({
    $or: [
      { phone, type: "phone" },
      { email: formattedEmail, type: "email" },
    ],
  });
 
  // Generate OTPs
  const otpForPhone = service.genrateOtp();
  const otpForEmail = service.genrateOtp();
 
  // Create Phone OTP
  await otpModel.create({
    fullName: trimmedName,
    phone,
    otp: otpForPhone,
    type: "phone",
  });
 
  // Create Email OTP
  await otpModel.create({
    fullName: trimmedName,
    email: formattedEmail,
    otp: otpForEmail,
    type: "email",
  });
 
  return response.responseHandlerWithData(
    res,
    true,
    responseCode.CREATED,
    "OTP sent successfully. It will expire in 1 minute.",
    {
      otpForPhone,
      otpForEmail,
    }
  );
});
// Verify OTP
exports.verifyOtp = catchAsyncError(async (req, res, next) => {
  const { email, phone, otp:{otpForPhone, otpForEmail} } = req.body;

  const currentTime = service.getCurrentTime();

  // Check if OTP exists
  const existingOtpWithPhone = await otpModel.findOne({ phone: phone });
  const existingOtpWithEmail = await otpModel.findOne({ email: email.toLowerCase().trim() });

  if (!existingOtpWithPhone && !existingOtpWithEmail) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "Both OTP Expired"
    );
  }
 
  if(existingOtpWithPhone){
    if(existingOtpWithPhone.otp !== otpForPhone){
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.UNAUTHORIZED,
        "Invalid OTP for phone"
      );
    }
    if(existingOtpWithPhone.expiresAt < currentTime){
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.UNAUTHORIZED,
        "OTP expired for phone"
      );
    }
  }

  if(existingOtpWithEmail){
    if(existingOtpWithEmail.otp !== otpForEmail){
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.UNAUTHORIZED,
        "Invalid OTP for email"
      );
    }
    if(existingOtpWithEmail.expiresAt < currentTime){
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.UNAUTHORIZED,
        "OTP expired for email"
      );
    }
  }

  // Delete OTP after successful verification
  await otpModel.deleteOne({ _id: existingOtpWithPhone._id });
  await otpModel.deleteOne({ _id: existingOtpWithEmail._id });

  //create user
  const userCreated = await AuthModel.create({
    fullName: existingOtpWithPhone.fullName,
    email: existingOtpWithEmail.email,
    phone: existingOtpWithPhone.phone,
    isVerified: true,
    isActive: true,
    stepCount: 0,
    isProfileCompleted: false,
  });

  if (!userCreated) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.INTERNAL_SERVER_ERROR,
      "Failed to create user"
    );
  }

  const token = service.generateToken({ id: userCreated._id });

  return response.responseHandlerWithData(
    res,
    true,
    responseCode.CREATED,
    "User created successfully",
    { user: userCreated, token: token }
  );
})

// resend OTP
exports.resendOtp = catchAsyncError(async (req, res, next) => {
  const {fullName, email, phone, type } = req.body;

  console.log("email:",email);

  if(type === "email"){
    const existingOtpWithEmail = await otpModel.findOne({ email: email.toLowerCase().trim() });
    console.log("existingOtpWithEmail:",existingOtpWithEmail);
    
    if(existingOtpWithEmail){
      console.log("existingOtpWithEmail found, deleting...");
      await otpModel.deleteOne({ _id: existingOtpWithEmail._id });
    }
     
    const otpGenerated = service.genrateOtp();

    const otpCreated = await otpModel.create({
      fullName: fullName,
      email: email.toLowerCase().trim(),
      otp: otpGenerated,
     });
     if(!otpCreated){
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.INTERNAL_SERVER_ERROR,
        "Failed to create OTP"
      );
    }
    return response.responseHandlerWithData(
      res,
      true,
      responseCode.CREATED,
      "OTP sent successfully. It will expire in 1 minute. Please verify your email with OTP.",
      { otpForEmail: otpGenerated }
    );
  }else{
    const existingOtpWithPhone = await otpModel.findOne({ phone: phone });
    if(existingOtpWithPhone){
      await otpModel.deleteOne({ _id: existingOtpWithPhone._id });
    }
    const otpGenerated = service.genrateOtp();
    const otpCreated = await otpModel.create({
      fullName: fullName,
      phone: phone,
      otp: otpGenerated,
    });
    if(!otpCreated){
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.INTERNAL_SERVER_ERROR,
        "Failed to create OTP"
      );
    }
    return response.responseHandlerWithData(
      res,
      true,
      responseCode.CREATED,
      "OTP sent successfully. It will expire in 1 minute. Please verify your phone number with OTP.",
      { otpForPhone: otpGenerated }
    );
  }
})

// set password
exports.setPassword = catchAsyncError(async (req, res, next) => {
  const { password } = req.body;

  const user = await AuthModel.findById(req.user.id);
  if (!user) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "User not found"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  return response.responseHandlerWithData(
    res,
    true,
    responseCode.CREATED,
    "Password set successfully",
    { user: user }
  );
})

// complete profile
exports.completeProfile = catchAsyncError(async (req, res, next) => {
  // Get user from token (set by verifyToken middleware)
  const user = await AuthModel.findById(req.user.id);
  
  if (!user) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "User not found"
    );
  }

  // Update all provided fields from req.body (already validated by Zod)
  const updateData = req.body;
  
  // Handle nested objects and arrays
  if (updateData.height) {
    user.height = {
      value: updateData.height.value ?? user.height?.value ?? null,
      unit: updateData.height.unit ?? user.height?.unit ?? "cm"
    };
  }

  if (updateData.weight) {
    user.weight = {
      value: updateData.weight.value ?? user.weight?.value ?? null,
      unit: updateData.weight.unit ?? user.weight?.unit ?? "kg"
    };
  }

  if (updateData.caregiver) {
    user.caregiver = {
      fullName: updateData.caregiver.fullName ?? user.caregiver?.fullName ?? null,
      relationship: updateData.caregiver.relationship ?? user.caregiver?.relationship ?? null,
      email: updateData.caregiver.email ?? user.caregiver?.email ?? null,
      phoneNumber: updateData.caregiver.phoneNumber ?? user.caregiver?.phoneNumber ?? null
    };
  }

  // Update simple fields
  const fieldsToUpdate = [
    'fullName', 'profilePicture', 'dateOfBirth', 'gender',
    'country', 'city', 'zipCode', 'hasPrivateInsurance', 'insuranceProviderName',
    'hasCancerDiagnosis', 'cancerType', 'cancerSubtype', 'cancerStage',
    'hasCancerProgressedOrRecurred', 'cancerDetails',
    'hasReceivedTreatment', 'treatments',
    'userRole', 'allowCaregiverManageRecords',
    'hasUndergoneTesting', 'geneticTests',
    'testReports', 'biomarkers',
    'onActiveTreatment', 'currentMedicationRegimen', 'treatingHospital',
    'oncologistName', 'nextFollowUpDate',
    'currentSymptoms', 'overallSymptomSeverity', 'experiencingSideEffects',
    'sideEffectsDescription', 'recentHospitalizations', 'enableWeeklyTracking',
    'hasOtherMedicalConditions', 'medicalConditions',
    'hasFamilyHistoryOfCancer', 'allergies',
    'aiAutoExtractPreference', 'pathologyReports', 'imagingReports',
    'treatmentSummaries', 'prescriptions', 'labResults',
    'interestedInClinicalTrials', 'clinicalTrialTravelPreference',
    'primaryGoals',
    'emotionalWellnessRating', 'wellbeingSupportAreas', 'additionalWellbeingNotes',
    'consentToStoreMedicalData', 'consentToResearchAndImprovement',
    'consentToPersonalizedAlerts', 'understandsRevocationRights',
    'agreesToPrivacyPolicy', 'consentsToDataForResearchAndAI',
    'stepCount'
  ];

  fieldsToUpdate.forEach(field => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  // Update stepCount if provided, otherwise increment if profile is being completed
  if (updateData.stepCount !== undefined) {
    user.stepCount = updateData.stepCount;
  } 

  // Mark profile as completed if all required consents are given
  // if (
  //   updateData.agreesToPrivacyPolicy === true &&
  //   updateData.consentToStoreMedicalData === true &&
  //   updateData.understandsRevocationRights === true
  // ) {
  //   user.isProfileCompleted = true;
  // }

  const mandatoryFields = [
    'fullName', 'profilePicture', 'dateOfBirth', 'gender',
    'country', 'city', 'zipCode', 'hasPrivateInsurance', 'insuranceProviderName',
    'hasCancerDiagnosis', 'cancerType', 'cancerSubtype', 'cancerStage',
    'hasCancerProgressedOrRecurred', 'cancerDetails',
    'hasReceivedTreatment', 'treatments',
    'userRole', 'allowCaregiverManageRecords',
    'hasUndergoneTesting', 'geneticTests',
    'testReports', 'biomarkers',
    'onActiveTreatment', 'currentMedicationRegimen', 'treatingHospital',
    'oncologistName', 'nextFollowUpDate',
    'hasOtherMedicalConditions', 'medicalConditions',
    'hasFamilyHistoryOfCancer', 'allergies',
    'consentToStoreMedicalData', 'consentToResearchAndImprovement',
    'consentToPersonalizedAlerts', 'understandsRevocationRights',
    'agreesToPrivacyPolicy', 'consentsToDataForResearchAndAI',
    'stepCount'
  ];

   const missingMandatoryFields = mandatoryFields.filter(field => !updateData[field]);

  if (missingMandatoryFields.length === 0) {
    user.isProfileCompleted = true;
  } 
   console.log("missingMandatoryFields:",missingMandatoryFields);

  await user.save();

  // Use aggregation to return only specific fields (excluding sensitive data)
  const userData = await AuthModel.aggregate([
    {
      $match: { _id: user._id }
    },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        fullName: 1,
        email: 1,
        phone: 1,
        profilePicture: 1,
        dateOfBirth: 1,
        gender: 1,
        height: 1,
        weight: 1,
        country: 1,
        city: 1,
        zipCode: 1,
        hasPrivateInsurance: 1,
        insuranceProviderName: 1,
        hasCancerDiagnosis: 1,
        cancerType: 1,
        cancerSubtype: 1,
        cancerStage: 1,
        hasCancerProgressedOrRecurred: 1,
        cancerDetails: 1,
        hasReceivedTreatment: 1,
        treatments: 1,
        userRole: 1,
        caregiver: 1,
        allowCaregiverManageRecords: 1,
        hasUndergoneTesting: 1,
        geneticTests: 1,
        testReports: 1,
        biomarkers: 1,
        onActiveTreatment: 1,
        currentMedicationRegimen: 1,
        treatingHospital: 1,
        oncologistName: 1,
        nextFollowUpDate: 1,
        currentSymptoms: 1,
        overallSymptomSeverity: 1,
        experiencingSideEffects: 1,
        sideEffectsDescription: 1,
        recentHospitalizations: 1,
        enableWeeklyTracking: 1,
        hasOtherMedicalConditions: 1,
        medicalConditions: 1,
        hasFamilyHistoryOfCancer: 1,
        allergies: 1,
        aiAutoExtractPreference: 1,
        pathologyReports: 1,
        imagingReports: 1,
        treatmentSummaries: 1,
        prescriptions: 1,
        labResults: 1,
        interestedInClinicalTrials: 1,
        clinicalTrialTravelPreference: 1,
        primaryGoals: 1,
        emotionalWellnessRating: 1,
        wellbeingSupportAreas: 1,
        additionalWellbeingNotes: 1,
        smokingStatus: 1,
        smokingFrequency: 1,
        alcoholConsumptionStatus: 1,
        alcoholConsumptionFrequency: 1,
        consentToStoreMedicalData: 1,
        consentToResearchAndImprovement: 1,
        consentToPersonalizedAlerts: 1,
        understandsRevocationRights: 1,
        agreesToPrivacyPolicy: 1,
        consentsToDataForResearchAndAI: 1,
        isVerified: 1,
        isActive: 1,
        isProfileCompleted: 1,
        stepCount: 1,
        language: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  if (!userData || userData.length === 0) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.INTERNAL_SERVER_ERROR,
      "Failed to fetch updated profile"
    );
  }

  return response.responseHandlerWithData(
    res,
    true,
    responseCode.CREATED,
    user.isProfileCompleted 
      ? "Profile completed successfully" 
      : "Profile updated successfully",
    {
      user: userData[0],
      missingMandatoryFields: missingMandatoryFields,
      mandatoryFields: mandatoryFields,
      isProfileCompleted: user.isProfileCompleted,
      stepCount: user.stepCount
    }
  );
});

// login using email and password or mobile number and otp -> if email and password are provided, then login using email and password, else login using mobile number and otp
exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password, phone, type } = req.body;
  const currentTime = service.getCurrentTime();

  if (type === "email") {
    const user = await AuthModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.NOT_FOUND,
        "User not found"
      );
    }

    if (user.isVerified === false) {
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.UNAUTHORIZED,
        "User not verified"
      );
    }

    // Check if password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.UNAUTHORIZED,
        "Invalid email or password"
      );
    }

    const token = service.generateToken({ id: user._id });

    const { password: _, ...userData } = user.toObject();

    return response.responseHandlerWithData(
      res,
      true,
      responseCode.CREATED,
      "Login successful",
      { user: userData, token: token }
    );

  } else if (type === "phone") {
    const user = await AuthModel.findOne({ phone: phone });

    if (!user) {
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.NOT_FOUND,
        "User not found"
      );
    }

    if (user.isVerified === false) {
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.UNAUTHORIZED,
        "User not verified"
      );
    }

    const existingOtp = await otpModel.findOne({ phone: phone });
    if (existingOtp) {
      await otpModel.deleteOne({ _id: existingOtp._id });
    }

    const otpGenerated = service.genrateOtp();

    const otpCreated = await otpModel.create({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      otp: otpGenerated,
    });

    if (!otpCreated) {
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.INTERNAL_SERVER_ERROR,
        "Failed to create OTP"
      );
    }

    return response.responseHandlerWithData(
      res,
      true,
      responseCode.CREATED,
      "OTP sent successfully. It will expire in 1 minute. Please verify your phone number with OTP.",
      { otp: otpGenerated }
    );
  }
})

// verify OTP for login using mobile number and otp
exports.verifyOtpForLogin = catchAsyncError(async (req, res) => {
  const { phone, otp } = req.body;

  const currentTime = service.getCurrentTime();

  const user = await AuthModel.findOne({ phone: phone });
  if (!user) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "User not found"
    );
  }

  const existingOtp = await otpModel.findOne({ phone: phone });
  if (!existingOtp) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "OTP expired"
    );
  }

  if (existingOtp.otp !== otp) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.UNAUTHORIZED,
      "Invalid OTP"
    );
  }

  if (existingOtp.expiresAt < currentTime) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.UNAUTHORIZED,
      "OTP expired"
    );
  }

  await otpModel.deleteOne({ _id: existingOtp._id });

  const token = service.generateToken({ id: user._id });
  const { password: _, ...userData } = user.toObject();

  return response.responseHandlerWithData(
    res,
    true,
    responseCode.CREATED,
    "Login successful",
    { user: userData, token: token }
  );
})

// forgot password using email 
exports.forgotPassword = catchAsyncError(async (req, res) => {
  const { email } = req.body;

  const user = await AuthModel.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "User not found"
    );
  }

  const existingOtp = await otpModel.findOne({ email: email.toLowerCase().trim() });
  if (existingOtp) {
    await otpModel.deleteOne({ _id: existingOtp._id });
  }

  const otpGenerated = service.genrateOtp();
  const otpCreated = await otpModel.create({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    otp: otpGenerated,
  });
  
  if (!otpCreated) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.INTERNAL_SERVER_ERROR,
      "Failed to create OTP"
    );
  }
  return response.responseHandlerWithData(
    res,
    true,
    responseCode.CREATED,
    "OTP sent successfully. It will expire in 1 minute. Please verify your email with OTP.",
    { otp: otpGenerated }
  );
})

exports.verifyOtpForForgotPassword = catchAsyncError(async (req, res, next) => {
  const { email,otp } = req.body;

  const currentTime = service.getCurrentTime();

  const user = await AuthModel.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "User not found"
    );
  }

  const existingOtp = await otpModel.findOne({ $or: [{ email: user.email.toLowerCase().trim() }, { phone: user.phone }] });
  if (!existingOtp) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "OTP expired"
    );
  }
  
  if (existingOtp.otp !== otp) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.UNAUTHORIZED,
      "Invalid OTP"
    );
  }
  
  if (existingOtp.expiresAt < currentTime) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.UNAUTHORIZED,
      "OTP expired"
    );
  }

  await otpModel.deleteOne({ _id: existingOtp._id });

  const token = service.generateToken({ id: user._id });

  return response.responseHandlerWithData(
    res,
    true,
    responseCode.CREATED,
    "OTP verified successfully, Using this please set your new password",
    { token: token }
  );
})

exports.getProfile = catchAsyncError(async (req, res) => {
  const user = await AuthModel.findById(req.user.id);
  if (!user) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "User not found"
    );
  }

  const profile = await AuthModel.aggregate([
    {
      $match: { _id: user._id }
    },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        fullName: 1,
        email: 1,
        phone: 1,
        profilePicture: 1,
        dateOfBirth: 1,
        gender: 1,
        height: 1,
        weight: 1,
        country: 1,
        city: 1,
        zipCode: 1,
        hasPrivateInsurance: 1,
        insuranceProviderName: 1,
        hasCancerDiagnosis: 1,
        cancerType: 1,
        cancerSubtype: 1,
        cancerStage: 1,
        hasCancerProgressedOrRecurred: 1,
        cancerDetails: 1,
        hasReceivedTreatment: 1,
        treatments: 1,
        userRole: 1,
        caregiver: 1,
        allowCaregiverManageRecords: 1,
        hasUndergoneTesting: 1,
        geneticTests: 1,
        testReports: 1,
        biomarkers: 1,
        onActiveTreatment: 1,
        currentMedicationRegimen: 1,
        treatingHospital: 1,
        oncologistName: 1,
        nextFollowUpDate: 1,
        currentSymptoms: 1,
        overallSymptomSeverity: 1,
        experiencingSideEffects: 1,
        sideEffectsDescription: 1,
        recentHospitalizations: 1,
        enableWeeklyTracking: 1,
        hasOtherMedicalConditions: 1,
        medicalConditions: 1,
        hasFamilyHistoryOfCancer: 1,
        allergies: 1,
        aiAutoExtractPreference: 1,
        pathologyReports: 1,
        imagingReports: 1,
        treatmentSummaries: 1,  
        prescriptions: 1,
        labResults: 1,
        interestedInClinicalTrials: 1,
        clinicalTrialTravelPreference: 1,
        primaryGoals: 1,
        emotionalWellnessRating: 1,
        wellbeingSupportAreas: 1,
        additionalWellbeingNotes: 1,
        smokingStatus: 1,
        smokingFrequency: 1,
        alcoholConsumptionStatus: 1,
        alcoholConsumptionFrequency: 1,
        consentToStoreMedicalData: 1,
        consentToResearchAndImprovement: 1,
        consentToPersonalizedAlerts: 1,
        understandsRevocationRights: 1,
        agreesToPrivacyPolicy: 1,
        consentsToDataForResearchAndAI: 1,
        isVerified: 1,
        isActive: 1,
        isProfileCompleted: 1,
        stepCount: 1,
        language: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  if (!profile || profile.length === 0) {
    return response.responseHandlerWithError(
      res,
      false,
      responseCode.NOT_FOUND,
      "Profile not found"
    );
  }

  console.log("profile:",profile);

  return response.responseHandlerWithData(
    res,
    true,
    responseCode.CREATED,
    "Profile fetched successfully",
    { profile: profile[0] }
  );
})