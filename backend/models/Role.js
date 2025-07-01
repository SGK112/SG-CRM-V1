module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '1=lowest access, 10=highest access (admin)'
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'System roles cannot be deleted'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['name']
      },
      {
        fields: ['level']
      },
      {
        fields: ['isActive']
      }
    ],
    hooks: {
      beforeCreate: (role) => {
        if (!role.slug) {
          role.slug = role.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
      }
    }
  });

  // Class method to create default roles
  Role.createDefaultRoles = async function() {
    const defaultRoles = [
      {
        name: 'Super Admin',
        slug: 'super-admin',
        description: 'Full system access and company management',
        level: 10,
        isSystem: true
      },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Company administration and user management',
        level: 9,
        isSystem: true
      },
      {
        name: 'Manager',
        slug: 'manager',
        description: 'Project and team management',
        level: 7,
        isSystem: true
      },
      {
        name: 'Estimator',
        slug: 'estimator',
        description: 'Create and manage estimates',
        level: 5,
        isSystem: true
      },
      {
        name: 'Sales Rep',
        slug: 'sales-rep',
        description: 'Customer management and sales activities',
        level: 4,
        isSystem: true
      },
      {
        name: 'Field Worker',
        slug: 'field-worker',
        description: 'View projects and update task status',
        level: 3,
        isSystem: true
      },
      {
        name: 'User',
        slug: 'user',
        description: 'Basic user access',
        level: 1,
        isSystem: true
      }
    ];

    for (const roleData of defaultRoles) {
      await Role.findOrCreate({
        where: { slug: roleData.slug },
        defaults: roleData
      });
    }
  };

  return Role;
};
