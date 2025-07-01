module.exports = (sequelize, DataTypes) => {
  const FileUpload = sequelize.define('FileUpload', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      }
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    
    // Related entities (optional)
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Customers',
        key: 'id'
      }
    },
    estimateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Estimates',
        key: 'id'
      }
    },
    
    // File information
    originalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Stored filename (usually UUID-based)'
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Full path to the file'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Public URL if hosted on cloud storage'
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'File size in bytes'
    },
    fileExtension: {
      type: DataTypes.STRING,
      allowNull: false
    },
    
    // Organization
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general',
      comment: 'File category (documents, images, contracts, etc.)'
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'More specific categorization'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    
    // Metadata
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Human-readable title for the file'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Image/Document specific
    dimensions: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Width/height for images, page count for PDFs, etc.'
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Thumbnail image path for previews'
    },
    
    // Access control
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether file can be accessed without authentication'
    },
    accessLevel: {
      type: DataTypes.ENUM('private', 'team', 'company', 'public'),
      defaultValue: 'company'
    },
    
    // Processing status
    processingStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'completed'
    },
    processingErrors: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    
    // Version control
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    parentFileId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'FileUploads',
        key: 'id'
      },
      comment: 'Reference to original file if this is a version'
    },
    
    // Storage information
    storageProvider: {
      type: DataTypes.STRING,
      defaultValue: 'local',
      comment: 'Storage provider (local, aws, cloudinary, etc.)'
    },
    storageKey: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Key/identifier in the storage system'
    },
    
    // Expiration and cleanup
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the file should be automatically deleted'
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'file_uploads',
    timestamps: true,
    indexes: [
      {
        fields: ['companyId']
      },
      {
        fields: ['uploadedBy']
      },
      {
        fields: ['projectId']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['estimateId']
      },
      {
        fields: ['category']
      },
      {
        fields: ['fileExtension']
      },
      {
        fields: ['isPublic']
      },
      {
        fields: ['accessLevel']
      },
      {
        fields: ['isArchived']
      },
      {
        fields: ['fileName']
      },
      {
        fields: ['parentFileId']
      }
    ]
  });

  // Instance methods
  FileUpload.prototype.getFileTypeCategory = function() {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'm4a'];
    
    const ext = this.fileExtension.toLowerCase();
    
    if (imageTypes.includes(ext)) return 'image';
    if (documentTypes.includes(ext)) return 'document';
    if (spreadsheetTypes.includes(ext)) return 'spreadsheet';
    if (videoTypes.includes(ext)) return 'video';
    if (audioTypes.includes(ext)) return 'audio';
    
    return 'other';
  };

  FileUpload.prototype.getFormattedSize = function() {
    const bytes = this.fileSize;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  FileUpload.prototype.generateThumbnail = async function() {
    const fileType = this.getFileTypeCategory();
    
    if (fileType === 'image') {
      // Implement image thumbnail generation
      // This would typically use a library like Sharp or ImageMagick
      console.log('Generating thumbnail for image:', this.fileName);
    } else if (fileType === 'document' && this.fileExtension.toLowerCase() === 'pdf') {
      // Implement PDF thumbnail generation
      // This would typically use a library like pdf2pic
      console.log('Generating thumbnail for PDF:', this.fileName);
    }
    
    // For now, just log - implement actual thumbnail generation based on your needs
  };

  FileUpload.prototype.createVersion = async function(newFileData) {
    const newVersion = await FileUpload.create({
      ...newFileData,
      companyId: this.companyId,
      projectId: this.projectId,
      customerId: this.customerId,
      estimateId: this.estimateId,
      category: this.category,
      parentFileId: this.parentFileId || this.id,
      version: this.version + 1,
      title: this.title,
      description: this.description,
      tags: this.tags
    });

    return newVersion;
  };

  FileUpload.prototype.archive = async function() {
    this.isArchived = true;
    this.archivedAt = new Date();
    await this.save();
  };

  FileUpload.prototype.canBeAccessedBy = function(user) {
    if (this.isPublic) return true;
    
    switch (this.accessLevel) {
      case 'public':
        return true;
      case 'company':
        return user.companyId === this.companyId;
      case 'team':
        // Implement team-based access logic
        return user.companyId === this.companyId;
      case 'private':
        return user.id === this.uploadedBy;
      default:
        return false;
    }
  };

  // Class methods
  FileUpload.getByCategory = async function(companyId, category, options = {}) {
    return await FileUpload.findAll({
      where: {
        companyId,
        category,
        isArchived: false,
        ...options.where
      },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  FileUpload.searchFiles = async function(companyId, searchTerm, options = {}) {
    const { Op } = require('sequelize');
    
    return await FileUpload.findAll({
      where: {
        companyId,
        isArchived: false,
        [Op.or]: [
          { originalName: { [Op.iLike]: `%${searchTerm}%` } },
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { tags: { [Op.contains]: [searchTerm] } }
        ],
        ...options.where
      },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  FileUpload.cleanupExpiredFiles = async function() {
    const { Op } = require('sequelize');
    
    const expiredFiles = await FileUpload.findAll({
      where: {
        expiresAt: {
          [Op.lte]: new Date()
        },
        isArchived: false
      }
    });

    for (const file of expiredFiles) {
      await file.archive();
      // Implement actual file deletion from storage here
    }

    return expiredFiles.length;
  };

  return FileUpload;
};
