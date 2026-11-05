const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      minLength: 3,
      maxLength: 30,
    },
    lastName: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Inavlid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      // select: false,
    },
    role: {
      type: String,
      enum: ["doctor", "nurse", "staff", "admin", "patient","admin"],
      default: "doctor",
    },

    specialization: {
      type: String,
    },

    department: {
      type: String,
    },

    qualification: {
      type: [String],
    },

    experience: {
      type: Number,
    },
    licenseNumber: {
      type: String,
      default: undefined
    },
    age: {
      type: Number,
      // required: true,
    },
    phone: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availableDays: {
      type: [String],
      enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    },

    availableTime: {
      from: String,
      to: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    // toObject: {
    //   transform(doc, ret) {         // This runs ONLY when: user.toObject()
    //     delete ret.password;
    //     delete ret.__v;
    //     return ret;
    //   },
    // },
  }
);
const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
