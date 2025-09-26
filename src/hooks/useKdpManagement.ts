import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from '@/utils/toast';
import { 
  bulkGenerateKdpDataThunk,
  editKdpDataThunk,
  uploadSingleBookThunk,
  fetchBookQueueThunk,
  selectKdpFlow
} from '@/redux/slices/kdpFlowSlice';
import { getKdpLoginStatus } from '@/services/additionalService';

export interface AmazonKDPSession {
  isConnected: boolean;
  lastConnected?: string;
  expiresAt?: string;
  email?: string;
}

export interface GeneratedBook {
  id: string;
  title: string;
  content: string;
  coverUrl: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  createdAt: string;
  status: 'Pending' | 'Review' | 'Uploaded';
  progress?: number;
  error?: string;
  estimatedTime?: number;
  kdpPhase?: 'Pending' | 'Review' | 'Uploaded';
  kdpProgress?: number;
  authorName?: string | null;
  price?: number | null;
  chapters?: number;
  manuscriptFilename?: string;
  coverFilename?: string;
  proofreadReport?: string;
  stats?: Record<string, any>;
  kdpFormData?: Record<string, any>;
}

export interface UseKdpManagementReturn {
  // KDP Session State
  amazonKDPSession: AmazonKDPSession;
  isCheckingKDPStatus: boolean;
  
  // KDP Operations State
  isUploading: boolean;
  uploadProgress: { status: string; progress: number } | null;
  
  // Actions
  checkAmazonKDPSession: (showLoading?: boolean) => Promise<void>;
  clearKDPSession: () => void;
  handleKDPConnectionSuccess: () => void;
  
  // KDP Workflow Actions
  generateKdpData: (book: GeneratedBook) => Promise<void>;
  editKdpData: (book: GeneratedBook) => Promise<void>;
  saveKdpData: (book: GeneratedBook, editedData: any) => Promise<void>;
  uploadBook: (book: GeneratedBook) => Promise<void>;
  generateKdpDataForBook: (book: GeneratedBook) => Promise<void>;
  
  // Utilities
  setUploadProgress: (progress: { status: string; progress: number } | null) => void;
}

export const useKdpManagement = (): UseKdpManagementReturn => {
  const dispatch = useDispatch();
  const kdpFlow = useSelector(selectKdpFlow);
  
  // KDP Session state
  const [amazonKDPSession, setAmazonKDPSession] = useState<AmazonKDPSession>({ isConnected: false });
  const [isCheckingKDPStatus, setIsCheckingKDPStatus] = useState(false);
  
  // KDP Operations state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ status: string; progress: number } | null>(null);

  // Check Amazon KDP session status
  const checkAmazonKDPSession = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsCheckingKDPStatus(true);
    }
    
    try {
      // First check localStorage for cached session
      const sessionData = localStorage.getItem('amazon_kdp_session');
      let cachedSession = null;
      
      if (sessionData) {
        try {
          cachedSession = JSON.parse(sessionData);
          const now = new Date();
          const expiresAt = new Date(cachedSession.expiresAt);
          
          // If cached session is expired, clear it
          if (expiresAt <= now) {
            localStorage.removeItem('amazon_kdp_session');
            cachedSession = null;
          } else {
            // If we have a valid cached session, use it immediately
            setAmazonKDPSession({
              isConnected: true,
              lastConnected: cachedSession.lastConnected,
              expiresAt: cachedSession.expiresAt,
              email: cachedSession.email || 'Connected'
            });
          }
        } catch (parseError) {
          console.error('Error parsing cached KDP session:', parseError);
          localStorage.removeItem('amazon_kdp_session');
          cachedSession = null;
        }
      }

      // Only call backend API if we don't have a valid cached session
      if (!cachedSession) {
        try {
          const response = await getKdpLoginStatus();
          const loginStatus = response.data;
          console.log('KDP Login Status from API:', loginStatus);
          
          if (loginStatus?.logged_in) {
            // KDP is connected according to backend
            const kdpSession = {
              isConnected: true,
              lastConnected: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
              email: 'Connected'
            };
            
            // Update localStorage with fresh session data
            localStorage.setItem('amazon_kdp_session', JSON.stringify(kdpSession));
            
            setAmazonKDPSession({
              isConnected: true,
              lastConnected: kdpSession.lastConnected,
              expiresAt: kdpSession.expiresAt,
              email: kdpSession.email
            });

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('kdp-session-updated'));
            
            if (showLoading) {
              toast.success('Amazon KDP connection verified successfully!');
            }
          } else {
            // KDP is not connected according to backend
            setAmazonKDPSession({ isConnected: false });
            
            if (showLoading) {
              toast.error('Amazon KDP is not connected. Please connect your account.');
            }
          }
        } catch (apiError) {
          console.error('Error checking KDP login status from API:', apiError);
          
          // If API call fails, keep using cached session if available
          if (cachedSession && cachedSession.isConnected) {
            setAmazonKDPSession({
              isConnected: true,
              lastConnected: cachedSession.lastConnected,
              expiresAt: cachedSession.expiresAt,
              email: cachedSession.email
            });
            
            if (showLoading) {
              toast.warning('Using cached KDP session. Connection status may be outdated.');
            }
          } else {
            setAmazonKDPSession({ isConnected: false });
            
            if (showLoading) {
              toast.error('Failed to check KDP connection status. Please try again.');
            }
          }
        }
      } else if (showLoading) {
        // We have a valid cached session, just show success
        toast.success('Amazon KDP connection is active!');
      }
    } catch (error) {
      console.error('Error checking Amazon KDP session:', error);
      if (showLoading) {
        toast.error('Error checking KDP connection status.');
      }
    } finally {
      if (showLoading) {
        setIsCheckingKDPStatus(false);
      }
    }
  }, []);

  // Clear KDP session
  const clearKDPSession = useCallback(() => {
    localStorage.removeItem('amazon_kdp_session');
    setAmazonKDPSession({ isConnected: false });
  }, []);

  // Handle KDP connection success
  const handleKDPConnectionSuccess = useCallback(() => {
    // Refresh the KDP session status after successful connection
    const sessionData = localStorage.getItem('amazon_kdp_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.isConnected) {
          setAmazonKDPSession({
            isConnected: true,
            lastConnected: session.lastConnected,
            expiresAt: session.expiresAt,
            email: session.email || 'Connected'
          });
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('kdp-session-updated'));
          
          toast.success('Amazon KDP connected successfully!');
          return;
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
    // Fallback to API check
    checkAmazonKDPSession();
  }, [checkAmazonKDPSession]);

  // Generate KDP Data
  const generateKdpData = useCallback(async (book: GeneratedBook) => {
    try {
      setIsUploading(true);

      console.log('Generating KDP data for book:', book.title);

      // Call bulk generate KDP data API
      const result = await dispatch(bulkGenerateKdpDataThunk({ book_ids: [book.id] }) as any).unwrap();

      if (!result) {
        setIsUploading(false);
        return;
      }

      console.log('KDP data generation response:', result);

      // After KDP data generation, check book queue status
      console.log('Checking book queue status after KDP data generation...');
      const queueResult = await dispatch(fetchBookQueueThunk() as any).unwrap();
      
      if (queueResult && queueResult.book_queue) {
        console.log('Book queue status after KDP generation:', queueResult.book_queue);
        
        // Find the book in the queue
        const queueBook = queueResult.book_queue.find((qBook: any) => 
          qBook.title === book.title || qBook.id === book.id
        );
        
        if (queueBook) {
          console.log('Found book in queue with KDP data:', queueBook);
          toast.success(`KDP data generated for "${book.title}"! You can now edit and upload.`);
        }
      }

      setIsUploading(false);
    } catch (error: any) {
      console.error('Error generating KDP data:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to generate KDP data');
      setIsUploading(false);
    }
  }, [dispatch]);

  // Edit KDP Data
  const editKdpData = useCallback(async (book: GeneratedBook) => {
    try {
      // Find the book index in the queue for the API call
      const queueResult = await dispatch(fetchBookQueueThunk() as any).unwrap();
      const queueBook = queueResult?.book_queue?.find((qBook: any) => 
        qBook.title === book.title || qBook.id === book.id
      );
      
      if (!queueBook) {
        toast.error('Book not found in queue');
        return;
      }

      // This would typically open an edit modal
      // For now, we'll just log the action
      console.log('Opening KDP edit modal for book:', book.title);
      
    } catch (error: any) {
      console.error('Error opening KDP edit modal:', error);
      toast.error('Failed to open KDP data editor');
    }
  }, [dispatch]);

  // Save KDP Data
  const saveKdpData = useCallback(async (book: GeneratedBook, editedData: any) => {
    try {
      setIsUploading(true);

      // Find the book index in the queue
      const queueResult = await dispatch(fetchBookQueueThunk() as any).unwrap();
      const queueBook = queueResult?.book_queue?.find((qBook: any) => 
        qBook.title === book.title || qBook.id === book.id
      );
      
      if (!queueBook) {
        toast.error('Book not found in queue');
        setIsUploading(false);
        return;
      }

      const bookIndex = queueBook.id || 0;

      // Call edit KDP data API
      const result = await dispatch(editKdpDataThunk({ book_index: bookIndex, data: editedData }) as any).unwrap();

      if (result) {
        toast.success(`KDP data updated for "${book.title}"`);
      }

      setIsUploading(false);
    } catch (error: any) {
      console.error('Error saving KDP data:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save KDP data');
      setIsUploading(false);
    }
  }, [dispatch]);

  // Upload Single Book
  const uploadBook = useCallback(async (book: GeneratedBook) => {
    try {
      setIsUploading(true);

      console.log('Uploading single book:', book.title);

      // Call upload single book API
      const result = await dispatch(uploadSingleBookThunk({ book_id: book.id }) as any).unwrap();

      if (result) {
        toast.success(`Book "${book.title}" uploaded successfully to KDP!`);
      }

      setIsUploading(false);
    } catch (error: any) {
      console.error('Error uploading book:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload book');
      setIsUploading(false);
    }
  }, [dispatch]);

  // Generate KDP Data for Book (bulk operation)
  const generateKdpDataForBook = useCallback(async (book: GeneratedBook) => {
    try {
      // Mark generating on this card (still Review status)
      // This would typically update the book state in the parent component

      // Step 4: Call bulk/generate-kdp-data API (this generates KDP data, not uploads)
      console.log('Step 4: Calling bulk/generate-kdp-data for KDP data generation');
      const bookIds = [book.id].filter(id => id);
      
      const response = await dispatch(bulkGenerateKdpDataThunk({
        book_ids: bookIds
      }) as any).unwrap();
      
      if (response?.data) {
        toast.success('KDP data generated successfully! Ready for publishing.');
      } else {
        toast.error('Failed to generate KDP data');
      }
    } catch (error: any) {
      console.error('Error generating KDP data for book:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to generate KDP data');
    }
  }, [dispatch]);

  // Initialize KDP session on mount
  useEffect(() => {
    // First try to load from localStorage immediately for better UX
    const sessionData = localStorage.getItem('amazon_kdp_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        if (expiresAt > now && session.isConnected) {
          // We have a valid cached session, use it immediately
          setAmazonKDPSession({
            isConnected: true,
            lastConnected: session.lastConnected,
            expiresAt: session.expiresAt,
            email: session.email || 'Connected'
          });
        } else {
          // Session expired, clear it
          localStorage.removeItem('amazon_kdp_session');
        }
      } catch (error) {
        console.error('Error parsing cached KDP session:', error);
        localStorage.removeItem('amazon_kdp_session');
      }
    }
    
    // Then check with API for verification
    checkAmazonKDPSession();
  }, [checkAmazonKDPSession]);

  return {
    // KDP Session State
    amazonKDPSession,
    isCheckingKDPStatus,
    
    // KDP Operations State
    isUploading,
    uploadProgress,
    
    // Actions
    checkAmazonKDPSession,
    clearKDPSession,
    handleKDPConnectionSuccess,
    
    // KDP Workflow Actions
    generateKdpData,
    editKdpData,
    saveKdpData,
    uploadBook,
    generateKdpDataForBook,
    
    // Utilities
    setUploadProgress
  };
};
