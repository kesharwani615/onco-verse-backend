const { z } = require("zod");

// Register User Validation Schema
const registerUserSchema = z.object({
  fullName: z
    .string({
      required_error: "Full name is required",
      invalid_type_error: "Full name must be a string",
    })
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),

  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    })
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
});

const verifyOtpSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    })
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  otp: z
    .string({
      required_error: "OTP is required",
      invalid_type_error: "OTP must be a string",
    })
    .min(6, "OTP must be at least 6 characters")
    .max(6, "OTP must not exceed 6 characters")
    .regex(/^\d{6}$/, "Invalid OTP format")
});

const setPasswordSchema = z.object({
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, "Invalid password format"),
    //example: Password@123
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim().regex(/^\S+@\S+\.\S+$/, "Invalid email format").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must not exceed 100 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, "Invalid password format").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(20, "Phone number must not exceed 20 characters").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
  type: z.enum(["email", "phone"]).optional(),
});

const verifyOtpForLoginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim().regex(/^\S+@\S+\.\S+$/, "Invalid email format").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(20, "Phone number must not exceed 20 characters").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
  type: z.enum(["email", "phone"]).optional(),
  otp: z.string().min(6, "OTP must be at least 6 characters").max(6, "OTP must not exceed 6 characters").regex(/^\d{6}$/, "Invalid OTP format"),
}).refine((data) => {
  if (data.email && data.phone) {
    return false;
  }
  return true;
}, {
  message: "Only one of email or phone should be provided",
  path: ["email", "phone"]
});

// Complete Profile Validation Schema (all fields optional for partial updates)
const completeProfileSchema = z.object({
  // Step 1: Basic Details
  fullName: z.string().min(2).max(100).trim().optional(),
  profilePicture: z.string().url("Invalid profile picture URL").nullable().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").transform((str) => str ? new Date(str) : null).nullable().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).nullable().optional(),
  height: z.object({
    value: z.number().min(0).optional().nullable(),
    unit: z.enum(["cm", "ft"]).optional()
  }).optional().nullable(),
  weight: z.object({
    value: z.number().min(0).optional().nullable(),
    unit: z.enum(["kg", "lbs"]).optional()
  }).optional().nullable(),
  country: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  zipCode: z.string().trim().optional().nullable(),
  hasPrivateInsurance: z.boolean().optional().nullable(),
  insuranceProviderName: z.string().trim().optional().nullable(),

  // Step 2: Diagnosis Status
  hasCancerDiagnosis: z.boolean().optional().nullable(),
  cancerType: z.enum([
    "Breast", "Lung", "Colorectal (Colon & Rectum)", "Prostate", "Cervical",
    "Ovarian", "Uterine / Endometrial", "Pancreatic", "Liver", "Stomach (Gastric)",
    "Esophageal", "Head & Neck", "Thyroid", "Kidney (Renal)", "Bladder",
    "Brain / CNS", "Skin (Melanoma)", "Skin (Non-melanoma)", "Leukemia",
    "Lymphoma", "Multiple Myeloma", "Sarcoma (Bone & Soft Tissue)", "Testicular",
    "Pediatric Cancer"
  ]).optional().nullable(),
  cancerSubtype: z.string().trim().optional().nullable(),
  cancerStage: z.enum([
    "Stage 0 (In situ)", "Stage I", "Stage II", "Stage III", "Stage IV",
    "Recurrent", "Metastatic", "Unknown / Not sure"
  ]).optional().nullable(),
  hasCancerProgressedOrRecurred: z.boolean().optional().nullable(),
  cancerDetails: z.string().trim().optional().nullable(),

  // Step 3: Treatment History
  hasReceivedTreatment: z.boolean().optional().nullable(),
  treatments: z.array(z.object({
    type: z.enum(["Surgery", "Chemotherapy", "Radiotherapy", "Targeted Therapy", "Immunotherapy", "Others"]),
    details: z.array(z.object({
      drugNameRegimen: z.string().trim().optional().nullable(),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((str) => str ? new Date(str) : null).optional().nullable(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((str) => str ? new Date(str) : null).optional().nullable(),
      lineOfTherapy: z.string().trim().optional().nullable(),
      responseToTreatment: z.enum(["Complete", "Partial", "Stable", "Progression"]).optional().nullable(),
      majorSideEffects: z.string().trim().optional().nullable(),
      reasonForStopping: z.string().trim().optional().nullable()
    })).optional()
  })).optional(),

  // Step 4: Caregiver Information
  userRole: z.enum(["Patient", "Caregiver"]).optional().nullable(),
  caregiver: z.object({
    fullName: z.string().trim().optional().nullable(),
    relationship: z.string().trim().optional().nullable(),
    email: z.string().email("Invalid email format").toLowerCase().trim().optional().nullable(),
    phoneNumber: z.string().trim().optional().nullable()
  }).optional().nullable(),
  allowCaregiverManageRecords: z.boolean().optional(),

  // Step 5: Genetic & Molecular Tests
  hasUndergoneTesting: z.boolean().optional().nullable(),
  hasReceivedTreatmentSoFar: z.boolean().optional().nullable(),
  geneticTests: z.array(z.enum([
    "Tumor profiling", "Liquid biopsy", "BRCA / Germline test",
    "FoundationOne / Guardant360", "IHC / Pathology (ER/PR/HER2)"
  ])).optional(),
  testReports: z.array(z.string().url("Invalid URL")).optional(),
  biomarkers: z.string().trim().optional().nullable(),

  // Step 6: Current Treatment Plan
  onActiveTreatment: z.boolean().optional().nullable(),
  currentMedicationRegimen: z.string().trim().optional().nullable(),
  treatingHospital: z.string().trim().optional().nullable(),
  oncologistName: z.string().trim().optional().nullable(),
  nextFollowUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((str) => str ? new Date(str) : null).optional().nullable(),

  // Step 7: Symptoms & Side Effects
  currentSymptoms: z.array(z.enum(["Fatigue", "Fever", "Short Breath", "Nausea", "Insomnia", "Other"])).optional(),
  overallSymptomSeverity: z.number().min(0).max(10).optional().nullable(),
  experiencingSideEffects: z.boolean().optional().nullable(),
  sideEffectsDescription: z.string().trim().optional().nullable(),
  recentHospitalizations: z.boolean().optional().nullable(),
  enableWeeklyTracking: z.boolean().optional(),

  // Step 8: Medical History
  hasOtherMedicalConditions: z.boolean().optional().nullable(),
  medicalConditions: z.array(z.enum([
    "Hypertension", "Diabetes mellitus", "Cardiovascular disease", "HIV",
    "Hepatitis infection", "Chronic obstructive pulmonary disease (COPD)",
    "Chronic kidney disease", "Hypothyroidism", "Asthma", "Chronic liver disease",
    "Cerebrovascular disease", "Pulmonary tuberculosis", "Renal Insufficiency", "Others"
  ])).optional(),
  otherMedicalConditionDetails: z.string().trim().optional().nullable(),
  hasFamilyHistoryOfCancer: z.boolean().optional().nullable(),
  allergies: z.array(z.string().trim()).optional(),

  // Step 9: Upload Medical Records
  aiAutoExtractPreference: z.boolean().optional(),
  pathologyReports: z.array(z.string().url("Invalid URL")).optional(),
  imagingReports: z.array(z.string().url("Invalid URL")).optional(),
  treatmentSummaries: z.array(z.string().url("Invalid URL")).optional(),
  prescriptions: z.array(z.string().url("Invalid URL")).optional(),
  labResults: z.array(z.string().url("Invalid URL")).optional(),

  // Step 10: Trial Enrollment
  interestedInClinicalTrials: z.boolean().optional().nullable(),
  clinicalTrialTravelPreference: z.enum(["Local only", "Within country", "International"]).optional().nullable(),

  // Step 11: Goals & Preferences
  primaryGoals: z.array(z.enum([
    "Track Symptoms & Side Effects", "Find Clinical Trials",
    "Manage Medical Records", "Community Support"
  ])).optional(),

  // Step 12: Wellbeing Check
  emotionalWellnessRating: z.number().min(1).max(10).optional().nullable(),
  wellbeingSupportAreas: z.array(z.enum([
    "Meditation & Mindfulness", "Support Groups", "Psychology Resources"
  ])).optional(),
  additionalWellbeingNotes: z.string().trim().optional().nullable(),

  // Step 13: Lifestyle
  smokingStatus: z.boolean().optional().nullable(),
  smokingFrequency: z.enum(["Never", "Occasional / Social", "Daily", "Former smoker"]).optional().nullable(),
  alcoholConsumptionStatus: z.boolean().optional().nullable(),
  alcoholConsumptionFrequency: z.enum(["Never", "Occasional / Social", "Weekly", "Daily"]).optional().nullable(),

  // Step 14: Data, Privacy & Legal Consent
  consentToStoreMedicalData: z.boolean().optional(),
  consentToResearchAndImprovement: z.boolean().optional(),
  consentToPersonalizedAlerts: z.boolean().optional(),
  understandsRevocationRights: z.boolean().optional(),
  agreesToPrivacyPolicy: z.boolean().optional(),
  consentsToDataForResearchAndAI: z.boolean().optional(),

  // Step tracking
  stepCount: z.number().min(0).max(14)
}).refine((data) => {
  // If smokingStatus is true, smokingFrequency should be provided
  if (data.smokingStatus === true && !data.smokingFrequency) {
    return false;
  }
  return true;
}, {
  message: "Smoking frequency is required when smoking status is yes",
  path: ["smokingFrequency"]
}).refine((data) => {
  // If alcoholConsumptionStatus is true, alcoholConsumptionFrequency should be provided
  if (data.alcoholConsumptionStatus === true && !data.alcoholConsumptionFrequency) {
    return false;
  }
  return true;
}, {
  message: "Alcohol consumption frequency is required when alcohol consumption status is yes",
  path: ["alcoholConsumptionFrequency"]
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim().regex(/^\S+@\S+\.\S+$/, "Invalid email format"),
});

const verifyOtpForForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim().regex(/^\S+@\S+\.\S+$/, "Invalid email format"),
  otp: z.string().min(6, "OTP must be at least 6 characters").max(6, "OTP must not exceed 6 characters").regex(/^\d{6}$/, "Invalid OTP format"),
});

module.exports = {
  registerUserSchema,
  verifyOtpSchema,
  setPasswordSchema,
  loginSchema,
  verifyOtpForLoginSchema,
  completeProfileSchema,
  forgotPasswordSchema,
  verifyOtpForForgotPasswordSchema,
};