module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
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
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Module this permission belongs to (users, customers, estimates, etc.)'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Action this permission allows (create, read, update, delete, approve, etc.)'
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Specific resource within the module (optional)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'permissions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['module']
      },
      {
        fields: ['action']
      },
      {
        fields: ['isActive']
      }
    ],
    hooks: {
      beforeCreate: (permission) => {
        if (!permission.slug) {
          permission.slug = `${permission.module}-${permission.action}${permission.resource ? '-' + permission.resource : ''}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
      }
    }
  });

  // Class method to create default permissions
  Permission.createDefaultPermissions = async function() {
    const modules = [
      'dashboard',
      'users',
      'customers',
      'estimates',
      'projects',
      'invoices',
      'payments',
      'files',
      'settings',
      'integrations',
      'reports',
      'notifications'
    ];

    const actions = ['create', 'read', 'update', 'delete', 'approve', 'manage'];

    const defaultPermissions = [];

    // Create permissions for each module
    for (const module of modules) {
      for (const action of actions) {
        // Skip some combinations that don't make sense
        if (module === 'dashboard' && ['create', 'update', 'delete', 'approve'].includes(action)) continue;
        if (module === 'reports' && ['create', 'update', 'delete', 'approve'].includes(action)) continue;

        defaultPermissions.push({
          name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.charAt(0).toUpperCase() + module.slice(1)}`,
          module,
          action,
          description: `Allows user to ${action} ${module}`
        });
      }
    }

    // Add special permissions
    const specialPermissions = [
      {
        name: 'Access Admin Panel',
        module: 'admin',
        action: 'access',
        description: 'Access to admin panel and company settings'
      },
      {
        name: 'Manage Company Settings',
        module: 'company',
        action: 'manage',
        description: 'Manage company-wide settings and configurations'
      },
      {
        name: 'View All Data',
        module: 'global',
        action: 'view-all',
        description: 'View all company data regardless of ownership'
      },
      {
        name: 'Manage Integrations',
        module: 'integrations',
        action: 'configure',
        description: 'Configure and manage third-party integrations'
      }
    ];

    defaultPermissions.push(...specialPermissions);

    for (const permData of defaultPermissions) {
      const slug = `${permData.module}-${permData.action}${permData.resource ? '-' + permData.resource : ''}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      await Permission.findOrCreate({
        where: { slug },
        defaults: { ...permData, slug }
      });
    }
  };

  return Permission;
};
