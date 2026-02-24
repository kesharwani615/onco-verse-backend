const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      minlength: 6
    },

    // Profile Picture
    profilePicture: {
      type: String,
      default: null
    },

    // Step 1: Basic Details
    dateOfBirth: {
      type: Date,
      default: null
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: null
    },

    height: {
      value: {
        type: Number,
        default: null,
        min: 0
      },
      unit: {
        type: String,
        enum: ["cm", "ft"],
        default: "cm"
      }
    },

    weight: {
      value: {
        type: Number,
        default: null,
        min: 0
      },
      unit: {
        type: String,
        enum: ["kg", "lbs"],
        default: "kg"
      }
    },

    // Location Details
    country: {
      type: String,
      default: null,
      trim: true
    },

    city: {
      type: String,
      default: null,
      trim: true
    },

    zipCode: {
      type: String,
      default: null,
      trim: true
    },

    // Insurance Details
    hasPrivateInsurance: {
      type: Boolean,
      default: null
    },

    insuranceProviderName: {
      type: String,
      default: null,
      trim: true
    },

    // Step 2: Diagnosis Status
    hasCancerDiagnosis: {
      type: Boolean,
      default: null
    },

    cancerType: {
      type: String,
      enum: [
        "Breast",
        "Lung",
        "Colorectal (Colon & Rectum)",
        "Prostate",
        "Cervical",
        "Ovarian",
        "Uterine / Endometrial",
        "Pancreatic",
        "Liver",
        "Stomach (Gastric)",
        "Esophageal",
        "Head & Neck",
        "Thyroid",
        "Kidney (Renal)",
        "Bladder",
        "Brain / CNS",
        "Skin (Melanoma)",
        "Skin (Non-melanoma)",
        "Leukemia",
        "Lymphoma",
        "Multiple Myeloma",
        "Sarcoma (Bone & Soft Tissue)",
        "Testicular",
        "Pediatric Cancer"
      ],
      default: null
    },

    cancerSubtype: {
      type: String,
      default: null,
      trim: true
    },

    cancerStage: {
      type: String,
      enum: [
        "Stage 0 (In situ)",
        "Stage I",
        "Stage II",
        "Stage III",
        "Stage IV",
        "Recurrent",
        "Metastatic",
        "Unknown / Not sure"
      ],
      default: null
    },

    hasCancerProgressedOrRecurred: {
      type: Boolean,
      default: null
    },

    cancerDetails: {
      type: String,
      default: null,
      trim: true
    },

    // Step 3: Treatment History
    hasReceivedTreatment: {
      type: Boolean,
      default: null
    },

    treatments: [{
      type: {
        type: String,
        enum: [
          "Surgery",
          "Chemotherapy",
          "Radiotherapy",
          "Targeted Therapy",
          "Immunotherapy",
          "Others"
        ],
        required: true
      },
      // Array to allow multiple regimens/instances of the same treatment type
      details: [{
        drugNameRegimen: {
          type: String,
          default: null,
          trim: true
        },
        startDate: {
          type: Date,
          default: null
        },
        endDate: {
          type: Date,
          default: null
        },
        lineOfTherapy: {
          type: String,
          default: null,
          trim: true
        },
        responseToTreatment: {
          type: String,
          enum: ["Complete", "Partial", "Stable", "Progression"],
          default: null
        },
        majorSideEffects: {
          type: String,
          default: null,
          trim: true
        },
        reasonForStopping: {
          type: String,
          default: null,
          trim: true
        }
      }]
    }],

    // Step 4: Caregiver Information
    userRole: {
      type: String,
      enum: ["Patient", "Caregiver"],
      default: null
    },

    caregiver: {
      fullName: {
        type: String,
        default: null,
        trim: true
      },
      relationship: {
        type: String,
        default: null,
        trim: true
        // Common relationships: "Spouse", "Parent", "Child", "Sibling", "Friend", "Other"
      },
      email: { 
        type: String,
        default: null,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
      },
      phoneNumber: {
        type: String,
        default: null,
        trim: true
      }
    },

    allowCaregiverManageRecords: {
      type: Boolean,
      default: false
    },

    // Step 5: Genetic & Molecular Tests
    hasUndergoneTesting: {
      type: Boolean,
      default: null
    },

    geneticTests: [{
      type: String,
      enum: [
        "Tumor profiling",
        "Liquid biopsy",
        "BRCA / Germline test",
        "FoundationOne / Guardant360", 
        "IHC / Pathology (ER/PR/HER2)"
      ]
    }],

    testReports: [{
      type: String, // Array of URLs to uploaded PDF/JPEG files
      default: null
    }],

    biomarkers: {
      type: String,
      default: null,
      trim: true
    },

    // Step 6: Current Treatment Plan
    onActiveTreatment: {
      type: Boolean,
      default: null
    },

    currentMedicationRegimen: {
      type: String,
      default: null,
      trim: true
    },

    treatingHospital: {
      type: String,
      default: null,
      trim: true
    },

    oncologistName: {
      type: String,
      default: null,
      trim: true
    },

    nextFollowUpDate: {
      type: Date,
      default: null
    },

    // Step 7: Symptoms & Side Effects
    currentSymptoms: [{
      type: String,
      enum: [
        "Fatigue",
        "Fever",
        "Short Breath",
        "Nausea",
        "Insomnia",
        "Other"
      ]
    }],

    overallSymptomSeverity: {
      type: Number,
      default: null,
      min: 0,
      max: 10
    },

    experiencingSideEffects: {
      type: Boolean,
      default: null
    },

    sideEffectsDescription: {
      type: String,
      default: null,
      trim: true
    },

    recentHospitalizations: {
      type: Boolean,
      default: null
    },

    enableWeeklyTracking: {
      type: Boolean,
      default: false
    },

    // Step 8: Medical History
    hasOtherMedicalConditions: {
      type: Boolean,
      default: null
    },

    medicalConditions: [{
      type: String,
      enum: [
        "Hypertension",
        "Diabetes mellitus",
        "Cardiovascular disease",
        "HIV",
        "Hepatitis infection",
        "Chronic obstructive pulmonary disease (COPD)",
        "Chronic kidney disease",
        "Hypothyroidism",
        "Asthma",
        "Chronic liver disease",
        "Cerebrovascular disease",
        "Pulmonary tuberculosis",
        "Renal Insufficiency",
        "Others"
      ]
    }],
    hasFamilyHistoryOfCancer: {
      type: Boolean,
      default: null
    },

    allergies: [{
      type: String,
      trim: true
    }],

    // Step 9: Upload Medical Records
    aiAutoExtractPreference: {
      type: Boolean,
      default: true
    },

    pathologyReports: [{
      type: String, // Array of URLs to uploaded files
      default: null
    }],

    imagingReports: [{
      type: String, // Array of URLs to uploaded PET/CT/MRI files
      default: null
    }],

    treatmentSummaries: [{
      type: String, // Array of URLs to uploaded treatment summary files
      default: null
    }],

    prescriptions: [{
      type: String, // Array of URLs to uploaded prescription files
      default: null
    }],

    labResults: [{
      type: String, // Array of URLs to uploaded lab result files
      default: null
    }],

    // Step 10: Trial Enrollment
    interestedInClinicalTrials: {
      type: Boolean,
      default: null
    },

    clinicalTrialTravelPreference: {
      type: String,
      enum: [
        "Local only",
        "Within country",
        "International"
      ],
      default: null
    },

    // Step 11: Goals & Preferences
    primaryGoals: [{
      type: String,
      enum: [
        "Track Symptoms & Side Effects",
        "Find Clinical Trials",
        "Manage Medical Records",
        "Community Support"
      ]
    }],

    // Step 12: Wellbeing Check - Emotional & Mental Wellbeing
    emotionalWellnessRating: {
      type: Number,
      default: null,
      min: 1,
      max: 10
    },

    wellbeingSupportAreas: [{
      type: String,
      enum: [
        "Meditation & Mindfulness",
        "Support Groups",
        "Psychology Resources"
      ]
    }],

    additionalWellbeingNotes: {
      type: String,
      default: null,
      trim: true
    },

    // Step 13: Lifestyle
    smokingStatus: {
      type: Boolean,
      default: null
    },

    smokingFrequency: {
      type: String,
      enum: [
        "Never",
        "Occasional / Social",
        "Daily",
        "Former smoker"
      ],
      default: null
    },

    alcoholConsumptionStatus: {
      type: Boolean,
      default: null
    },

    alcoholConsumptionFrequency: {
      type: String,
      enum: [
        "Never",
        "Occasional / Social",
        "Weekly",
        "Daily"
      ],
      default: null
    },

    // Step 14: Data, Privacy & Legal Consent
    consentToStoreMedicalData: {
      type: Boolean,
      default: false
    },

    consentToResearchAndImprovement: {
      type: Boolean,
      default: false
    },

    consentToPersonalizedAlerts: {
      type: Boolean,
      default: false
    },

    understandsRevocationRights: {
      type: Boolean,
      default: false
    },

    agreesToPrivacyPolicy: {
      type: Boolean,
      default: false
    },

    consentsToDataForResearchAndAI: {
      type: Boolean,
      default: false
    },

    // Existing fields
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isProfileCompleted: {
      type: Boolean,
      default: false
    },
    stepCount: {
      type: Number,
      default: 0
    },  
    language: {
      type: String,
      enum: ["english", "hindi", "marathi", "gujarati", "kannada", "telugu", "tamil", "urdu"],
      default: "english"
    }
  },
  {
    timestamps: true
  }
);

// Instance method to check if password is correct
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);