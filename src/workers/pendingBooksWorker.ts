// Web Worker for handling long-running book generation processes
// This worker runs in the background without freezing the UI

interface WorkerMessage {
  type: 'START_GENERATION' | 'CHECK_STATUS' | 'STOP_GENERATION';
  data?: any;
}

interface WorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR' | 'STATUS_UPDATE';
  data?: any;
  progress?: number;
  message?: string;
}

// Simulate a long-running book generation process
class BookGenerationWorker {
  private isRunning = false;
  private progress = 0;
  private intervalId: number | null = null;
  private maxProgress = 100;
  private stepSize = 2; // Progress increment per step
  private stepInterval = 1000; // 1 second between steps

  startGeneration(bookData: any) {
    if (this.isRunning) {
      this.sendResponse({
        type: 'ERROR',
        message: 'Generation already in progress'
      });
      return;
    }

    this.isRunning = true;
    this.progress = 0;

    // Send initial status
    this.sendResponse({
      type: 'PROGRESS',
      progress: 0,
      message: 'Starting book generation...'
    });

    // Simulate the generation process with progress updates
    this.intervalId = setInterval(() => {
      this.progress += this.stepSize;
      
      if (this.progress >= this.maxProgress) {
        this.progress = this.maxProgress;
        this.completeGeneration(bookData);
      } else {
        this.sendProgressUpdate();
      }
    }, this.stepInterval) as any;
  }

  private sendProgressUpdate() {
    let message = '';
    
    if (this.progress < 20) {
      message = 'Initializing book generation...';
    } else if (this.progress < 40) {
      message = 'Generating book content...';
    } else if (this.progress < 60) {
      message = 'Creating book structure...';
    } else if (this.progress < 80) {
      message = 'Generating cover and metadata...';
    } else if (this.progress < 95) {
      message = 'Finalizing book generation...';
    } else {
      message = 'Almost complete...';
    }

    this.sendResponse({
      type: 'PROGRESS',
      progress: this.progress,
      message
    });
  }

  private completeGeneration(bookData: any) {
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Simulate generated book data
    const generatedBook = {
      id: Date.now().toString(),
      title: bookData.title || 'Generated Book',
      content: this.generateBookContent(bookData),
      coverUrl: this.generateCoverUrl(bookData.title),
      niche: bookData.niche || 'General',
      targetAudience: bookData.targetAudience || 'General Audience',
      wordCount: 5000 + Math.floor(Math.random() * 5000),
      createdAt: new Date().toISOString(),
      status: 'Review' as const,
      kdpPhase: 'Review' as const,
      chapters: Math.floor(Math.random() * 10) + 5,
      authorName: bookData.authorName || null,
      price: bookData.price || null,
      manuscriptFilename: `manuscript_${Date.now()}.txt`,
      coverFilename: `cover_${Date.now()}.jpg`,
      proofreadReport: 'Book has been proofread and is ready for publication.',
      stats: {
        readability: 'A+',
        seoScore: 95,
        wordCount: 5000 + Math.floor(Math.random() * 5000)
      }
    };

    this.sendResponse({
      type: 'COMPLETE',
      data: generatedBook,
      progress: 100,
      message: 'Book generation completed successfully!'
    });
  }

  private generateBookContent(bookData: any): string {
    const title = bookData.title || 'Generated Book';
    const niche = bookData.niche || 'General';
    const targetAudience = bookData.targetAudience || 'General Audience';
    
    return `# ${title}

## Table of Contents
1. Introduction
2. Understanding ${niche}
3. Practical Applications
4. Advanced Strategies
5. Conclusion

## Introduction
Welcome to this comprehensive guide on ${niche}. This book is specifically designed for ${targetAudience} who want to gain deep insights and practical knowledge in this field.

## Understanding ${niche}
In this chapter, we explore the fundamental concepts and principles that form the foundation of ${niche}. Understanding these core ideas is essential for anyone looking to excel in this area.

## Practical Applications
Here we dive into real-world applications and case studies that demonstrate how the concepts discussed can be applied in practice. These examples are carefully selected to be relevant to ${targetAudience}.

## Advanced Strategies
This chapter covers advanced techniques and strategies that can help you take your understanding to the next level. These insights are based on extensive research and practical experience.

## Conclusion
We conclude with a summary of key takeaways and recommendations for continued learning and development in ${niche}.

---
Generated on: ${new Date().toLocaleDateString()}
Niche: ${niche}
Target Audience: ${targetAudience}
Word Count: ${5000 + Math.floor(Math.random() * 5000)} words`;
  }

  private generateCoverUrl(title: string): string {
    const encodedTitle = encodeURIComponent(title);
    return `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodedTitle}`;
  }

  checkStatus() {
    this.sendResponse({
      type: 'STATUS_UPDATE',
      data: {
        isRunning: this.isRunning,
        progress: this.progress,
        message: this.isRunning ? 'Generation in progress...' : 'Ready'
      }
    });
  }

  stopGeneration() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    this.progress = 0;

    this.sendResponse({
      type: 'COMPLETE',
      data: null,
      progress: 0,
      message: 'Generation stopped by user'
    });
  }

  private sendResponse(response: WorkerResponse) {
    self.postMessage(response);
  }
}

// Create worker instance
const worker = new BookGenerationWorker();

// Handle messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'START_GENERATION':
        worker.startGeneration(data);
        break;
      case 'CHECK_STATUS':
        worker.checkStatus();
        break;
      case 'STOP_GENERATION':
        worker.stopGeneration();
        break;
      default:
        self.postMessage({
          type: 'ERROR',
          message: `Unknown message type: ${type}`
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      message: `Worker error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Export types for use in main thread
export type { WorkerMessage, WorkerResponse };
