# Additional API Service Usage Examples

This document provides examples of how to use the new `AdditionalService` API endpoints in your React components.

## Import the Service

```typescript
import { AdditionalService } from '../api';
// or
import AdditionalService from '../api/additionalService';
```

## Configuration Management

### Update Configuration
```typescript
const updateConfig = async () => {
  try {
    const response = await AdditionalService.updateConfiguration({
      maxBooksPerUser: 100,
      defaultWordCount: 5000,
      enableAutoGeneration: true,
      notificationSettings: {
        email: true,
        push: false
      }
    });
    console.log('Configuration updated:', response.data);
  } catch (error) {
    console.error('Failed to update configuration:', error);
  }
};
```

## Book Generation

### Generate Single Book
```typescript
const generateBook = async () => {
  try {
    const response = await AdditionalService.generateBook({
      prompt: "Write a comprehensive guide about sustainable living",
      niche: "environment",
      targetAudience: "eco-conscious individuals",
      wordCount: 10000,
      genre: "non_fiction",
      language: "en",
      tone: "informative"
    });
    console.log('Book generation started:', response.data);
  } catch (error) {
    console.error('Failed to generate book:', error);
  }
};
```

### Auto Generate Books
```typescript
const autoGenerateBooks = async () => {
  try {
    const response = await AdditionalService.autoGenerateBooks({
      niche: "technology",
      targetAudience: "developers",
      wordCount: 8000,
      count: 5 // Generate 5 books
    });
    console.log('Auto generation started:', response.data);
  } catch (error) {
    console.error('Failed to auto generate books:', error);
  }
};
```

### Generate Pending Books
```typescript
const generatePendingBooks = async () => {
  try {
    const response = await AdditionalService.generatePendingBooks();
    console.log('Pending books generation started:', response.data);
  } catch (error) {
    console.error('Failed to generate pending books:', error);
  }
};
```

## Bulk Operations

### Bulk Clear All
```typescript
const bulkClearAll = async () => {
  try {
    const response = await AdditionalService.bulkClearAll({
      confirm: true,
      includeBooks: true,
      includeUsers: false,
      includeAnalytics: true
    });
    console.log('Bulk clear completed:', response.data);
  } catch (error) {
    console.error('Failed to bulk clear:', error);
  }
};
```

### Bulk Reset Pending
```typescript
const bulkResetPending = async () => {
  try {
    const response = await AdditionalService.bulkResetPending({
      bookIds: ['book1', 'book2', 'book3'],
      resetAll: false
    });
    console.log('Bulk reset completed:', response.data);
  } catch (error) {
    console.error('Failed to bulk reset:', error);
  }
};
```

### Bulk Generate KDP Data
```typescript
const bulkGenerateKdpData = async () => {
  try {
    const response = await AdditionalService.bulkGenerateKdpData({
      bookIds: ['book1', 'book2'],
      generateAll: false,
      includeMetadata: true
    });
    console.log('KDP data generation started:', response.data);
  } catch (error) {
    console.error('Failed to generate KDP data:', error);
  }
};
```

## File Upload

### Upload Single Book
```typescript
const uploadBook = async (bookId: string, file: File) => {
  try {
    const response = await AdditionalService.uploadBook({
      bookId,
      file,
      format: 'pdf',
      metadata: {
        title: 'My Book',
        author: 'John Doe'
      }
    });
    console.log('Book upload started:', response.data);
  } catch (error) {
    console.error('Failed to upload book:', error);
  }
};
```

### Bulk Upload Books
```typescript
const bulkUploadBooks = async (books: Array<{bookId: string, file: File}>) => {
  try {
    const response = await AdditionalService.bulkUploadBooks({
      books: books.map(book => ({
        bookId: book.bookId,
        file: book.file,
        format: 'pdf'
      }))
    });
    console.log('Bulk upload started:', response.data);
  } catch (error) {
    console.error('Failed to bulk upload books:', error);
  }
};
```

### Get Upload Progress
```typescript
const getUploadProgress = async () => {
  try {
    const response = await AdditionalService.getUploadProgress();
    const progress = response.data;
    console.log('Upload progress:', AdditionalService.formatUploadProgress(progress));
  } catch (error) {
    console.error('Failed to get upload progress:', error);
  }
};
```

### Retry Failed Uploads
```typescript
const retryFailedUploads = async () => {
  try {
    const response = await AdditionalService.retryFailedUploads({
      retryAll: true
    });
    console.log('Retry started:', response.data);
  } catch (error) {
    console.error('Failed to retry uploads:', error);
  }
};
```

## Debug & Monitoring

### Debug Book Status
```typescript
const debugBookStatus = async (bookId: string) => {
  try {
    const response = await AdditionalService.debugBookStatus(bookId);
    console.log('Book status debug:', response.data);
  } catch (error) {
    console.error('Failed to debug book status:', error);
  }
};
```

### Get Book Queue
```typescript
const getBookQueue = async () => {
  try {
    const response = await AdditionalService.getBookQueue();
    const queue = response.data;
    
    queue.queue.forEach(item => {
      console.log(`${AdditionalService.getQueueTypeIcon(item.type)} ${item.type} - ${item.status}`);
      console.log(`Created: ${AdditionalService.formatQueueTime(item.createdAt)}`);
    });
  } catch (error) {
    console.error('Failed to get book queue:', error);
  }
};
```

### Get Environment Status
```typescript
const getEnvStatus = async () => {
  try {
    const response = await AdditionalService.getEnvStatus();
    const status = response.data;
    
    console.log('Environment:', status.environment);
    console.log('Version:', status.version);
    console.log('Database:', status.database.status);
    console.log('Uptime:', AdditionalService.formatSystemUptime(status.system.uptime));
    console.log('Memory:', AdditionalService.formatMemoryUsage(status.system.memory));
    
    Object.entries(status.services).forEach(([name, service]) => {
      console.log(`${name}: ${service.status}`);
    });
  } catch (error) {
    console.error('Failed to get environment status:', error);
  }
};
```

## React Component Examples

### Configuration Management Component
```typescript
import React, { useState } from 'react';
import { AdditionalService, ConfigurationUpdate } from '../api';

const ConfigurationManager: React.FC = () => {
  const [config, setConfig] = useState<ConfigurationUpdate>({});
  const [loading, setLoading] = useState(false);

  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      const validation = AdditionalService.validateConfigurationUpdate(config);
      if (!validation.isValid) {
        alert(`Validation errors: ${validation.errors.join(', ')}`);
        return;
      }

      await AdditionalService.updateConfiguration(config);
      alert('Configuration updated successfully!');
    } catch (error) {
      alert('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Configuration Manager</h2>
      <textarea
        value={JSON.stringify(config, null, 2)}
        onChange={(e) => setConfig(JSON.parse(e.target.value))}
        placeholder="Enter configuration JSON"
      />
      <button onClick={handleUpdateConfig} disabled={loading}>
        {loading ? 'Updating...' : 'Update Configuration'}
      </button>
    </div>
  );
};
```

### Upload Progress Component
```typescript
import React, { useState, useEffect } from 'react';
import { AdditionalService, UploadProgressResponse } from '../api';

const UploadProgress: React.FC = () => {
  const [progress, setProgress] = useState<UploadProgressResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = async () => {
    try {
      const response = await AdditionalService.getUploadProgress();
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchProgress, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  if (!progress) return <div>Loading...</div>;

  return (
    <div>
      <h3>Upload Progress</h3>
      <div className={`status ${AdditionalService.getUploadStatusColor(progress.status)}`}>
        {progress.status.toUpperCase()}
      </div>
      <div>Progress: {AdditionalService.formatUploadProgress(progress)}</div>
      {progress.currentFile && <div>Current: {progress.currentFile}</div>}
      {progress.errors && progress.errors.length > 0 && (
        <div className="errors">
          <h4>Errors:</h4>
          {progress.errors.map((error, index) => (
            <div key={index} className="error">{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### System Status Dashboard
```typescript
import React, { useState, useEffect } from 'react';
import { AdditionalService, EnvStatusResponse } from '../api';

const SystemStatusDashboard: React.FC = () => {
  const [status, setStatus] = useState<EnvStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await AdditionalService.getEnvStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading system status...</div>;
  if (!status) return <div>Failed to load system status</div>;

  return (
    <div className="system-status">
      <h2>System Status</h2>
      
      <div className="overview">
        <div>Environment: {status.environment}</div>
        <div>Version: {status.version}</div>
        <div>Uptime: {AdditionalService.formatSystemUptime(status.system.uptime)}</div>
      </div>

      <div className="database">
        <h3>Database</h3>
        <div className={`status ${AdditionalService.getDatabaseStatusColor(status.database.status)}`}>
          {status.database.status}
        </div>
        {status.database.connectionTime && (
          <div>Connection Time: {status.database.connectionTime}ms</div>
        )}
      </div>

      <div className="services">
        <h3>Services</h3>
        {Object.entries(status.services).map(([name, service]) => (
          <div key={name} className="service">
            <span className="name">{name}</span>
            <span className={`status ${AdditionalService.getServiceStatusColor(service.status)}`}>
              {service.status}
            </span>
            {service.responseTime && (
              <span className="response-time">{service.responseTime}ms</span>
            )}
          </div>
        ))}
      </div>

      <div className="system">
        <h3>System Resources</h3>
        <div>Memory: {AdditionalService.formatMemoryUsage(status.system.memory)}</div>
        <div>CPU Usage: {status.system.cpu.usage}%</div>
      </div>
    </div>
  );
};
```

## Error Handling

All API calls should be wrapped in try-catch blocks to handle errors gracefully:

```typescript
const handleApiCall = async () => {
  try {
    const response = await AdditionalService.someMethod();
    // Handle success
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
  }
};
```

## TypeScript Types

All the types are exported from the main API index file, so you can import them as needed:

```typescript
import type {
  ConfigurationUpdate,
  ConfigurationResponse,
  BulkOperationResponse,
  UploadProgressResponse,
  BookQueueResponse,
  EnvStatusResponse
} from '../api';
```
