const { User, Donor, Hospital } = require('../models');
const { Op } = require('sequelize');

const SYSTEM_USER_EMAILS = ['historical-import@bloodsuite.local'];

const deriveUserName = (user) => {
  if (user.donor?.full_name) {
    return user.donor.full_name;
  }

  if (user.hospital?.hospital_name) {
    return user.hospital.hospital_name;
  }

  return user.email.split('@')[0];
};

const serializeUser = (user) => ({
  id: user.id,
  name: deriveUserName(user),
  email: user.email,
  role: user.role,
  status: user.is_active ? 'active' : 'inactive',
  createdAt: user.createdAt,
  hospitalName: user.hospital?.hospital_name || null,
  bloodType: user.donor?.blood_type || null,
  phone: user.donor?.phone || user.hospital?.phone || null,
});

const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const where = {
      email: {
        [Op.notIn]: SYSTEM_USER_EMAILS,
      },
    };

    if (role) {
      where.role = role;
    }

    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      include: [
        { model: Donor, as: 'donor', attributes: ['full_name', 'blood_type', 'phone'], required: false },
        { model: Hospital, as: 'hospital', attributes: ['hospital_name', 'phone', 'license_number', 'approval_status'], required: false },
      ],
      order: [['created_at', 'DESC']],
    });

    const filteredUsers = search
      ? users.filter((user) => {
          const haystack = [
            user.email,
            user.donor?.full_name,
            user.hospital?.hospital_name,
          ].filter(Boolean).join(' ').toLowerCase();

          return haystack.includes(search.toLowerCase());
        })
      : users;

    res.json({
      success: true,
      data: filteredUsers.map(serializeUser),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_active must be a boolean value',
      });
    }

    const user = await User.findByPk(id, {
      include: [
        { model: Donor, as: 'donor', attributes: ['full_name'], required: false },
        { model: Hospital, as: 'hospital', attributes: ['hospital_name'], required: false },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (SYSTEM_USER_EMAILS.includes(user.email)) {
      return res.status(400).json({ success: false, error: 'System users cannot be modified from the dashboard' });
    }

    await user.update({ is_active });

    res.json({
      success: true,
      data: serializeUser(user),
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
};
