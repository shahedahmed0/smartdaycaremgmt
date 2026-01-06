const crypto = require("crypto");
const User = require("../models/User");

// Helper: generate a readable random password
const generateTempPassword = () => {
  // 10 chars base64-ish, remove confusing chars
  return crypto
    .randomBytes(8)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10);
};

// @desc    Create a staff user (admin only)
// @route   POST /api/users/staff
// @access  Private (admin)
// exports.createStaff = async (req, res) => {
//   try {
//     const { name, email, phone, experience, joiningDate, password } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide name and email'
//       });
//     }

//     const existing = await User.findOne({ email: email.toLowerCase() });
//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         error: 'A user already exists with this email'
//       });
//     }

//     const tempPassword = password && String(password).trim().length >= 6 ? String(password).trim() : generateTempPassword();

//     const staff = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: tempPassword,
//       role: 'staff',
//       phone: phone || undefined,
//       experience: (experience === '' || experience === null || experience === undefined) ? undefined : Number(experience),
//       joiningDate: joiningDate ? new Date(joiningDate) : undefined
//     });

//     // Don't expose password hash; but if we generated a temp password, return it to admin
//     res.status(201).json({
//       success: true,
//       message: 'Staff account created',
//       data: {
//         id: staff._id,
//         name: staff.name,
//         email: staff.email,
//         role: staff.role,
//         phone: staff.phone,
//         experience: staff.experience,
//         joiningDate: staff.joiningDate
//       },
//       tempPassword: password ? undefined : tempPassword
//     });
//   } catch (error) {
//     console.error('Create staff error:', error);
//     res.status(400).json({
//       success: false,
//       error: error.message || 'Failed to create staff'
//     });
//   }
// };

exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone, experience, joiningDate, password, staffRole } =
      req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Please provide name and email",
      });
    }

    const allowedRoles = ["caregiver", "teacher", "cook"];
    if (!staffRole || !allowedRoles.includes(staffRole)) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing staff role",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "A user already exists with this email",
      });
    }

    const tempPassword =
      password && String(password).trim().length >= 6
        ? String(password).trim()
        : generateTempPassword();

    const staff = await User.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      role: "staff", // system role
      staffRole, // 👈 frontend value
      phone: phone || undefined,
      experience:
        experience === "" || experience == null
          ? undefined
          : Number(experience),
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Staff account created",
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        staffRole: staff.staffRole,
        phone: staff.phone,
        experience: staff.experience,
        joiningDate: staff.joiningDate,
      },
      tempPassword: password ? undefined : tempPassword,
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create staff",
    });
  }
};

// @desc    Get all staff users (admin only)
// @route   GET /api/users/staff
// @access  Private (admin)
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" })
      .select(
        "name email role phone experience joiningDate createdAt staffRole"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    console.error("Get staff error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch staff",
    });
  }
};

// @desc    Get users for chat (parents see staff, staff see parents)
// @route   GET /api/users/chat-users
// @access  Private
exports.getUsersForChat = async (req, res) => {
  try {
    const currentUser = req.user;
    
    let users;
    if (currentUser.role === 'parent') {
      // Parents see all staff members
      users = await User.find({ role: 'staff' })
        .select('name email role staffRole _id')
        .sort({ name: 1 });
    } else if (currentUser.role === 'staff') {
      // Staff see all parents
      users = await User.find({ role: 'parent' })
        .select('name email role _id')
        .sort({ name: 1 });
    } else {
      // Admin can see both
      users = await User.find({ role: { $in: ['parent', 'staff'] } })
        .select('name email role staffRole _id')
        .sort({ role: 1, name: 1 });
    }

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users for chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users for chat'
    });
  }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("role");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Safety: prevent deleting admins through this endpoint
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        error: "Cannot delete admin accounts",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
};

// @desc    Get current user's profile (staff)
// @route   GET /api/users/profile
// @access  Private (staff)
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select('-password')
      .populate('childList', 'name age photo');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is for staff members only'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

// @desc    Update current user's profile (staff)
// @route   PUT /api/users/profile
// @access  Private (staff)
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      phone,
      address,
      bio,
      qualifications,
      certifications,
      experience,
      joiningDate,
      emergencyContact
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is for staff members only'
      });
    }

    // Update allowed fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;
    if (qualifications !== undefined) {
      user.qualifications = Array.isArray(qualifications) ? qualifications : [];
    }
    if (certifications !== undefined) {
      user.certifications = Array.isArray(certifications) ? certifications : [];
    }
    if (experience !== undefined) {
      user.experience = experience === '' ? undefined : Number(experience);
    }
    if (joiningDate !== undefined) {
      user.joiningDate = joiningDate ? new Date(joiningDate) : undefined;
    }
    if (emergencyContact !== undefined) {
      user.emergencyContact = emergencyContact;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId)
      .select('-password')
      .populate('childList', 'name age photo');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
};

// @desc    Upload profile photo (staff)
// @route   POST /api/users/profile/photo
// @access  Private (staff)
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is for staff members only'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a photo'
      });
    }

    const photoPath = `/uploads/${req.file.filename}`;
    user.profilePhoto = photoPath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile photo'
    });
  }
};
