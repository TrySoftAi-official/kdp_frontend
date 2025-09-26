import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  generateBook,
  autoGenerateBooks,
  bulkGenerateKdpData,
  editKdpData,
  getBookQueueStatus,
  bulkUploadBooks,
  bulkUploadBooksWithDelay,
  BookQueueResponse as ServiceBookQueueResponse,
  BulkOperationResponse,
  BulkActionResponse,
} from '../../services/additionalService';
import { AxiosError } from 'axios';

// Types aligned with requirements
export interface KdpData {
  title: string;
  description: string;
  keywords: string[];
}

export type BookStatus = 'pending' | 'review' | 'uploaded';

export interface Book {
  id: string;
  title: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  status: BookStatus;
  kdpData?: KdpData;
}

export interface GenerateBookRequest {
  user_prompt: string;
  n?: number;
}

export interface GenerateBookResponse {
  message: string;
  rows: number;
  columns: string[];
  data_preview: any[];
  book_queue: any[];
}

export interface BookQueueResponse {
  book_queue: Book[];
  processed: number;
  total: number;
}

export interface EditKdpDataPayload {
  book_index: number;
  data: KdpData;
}

interface KdpFlowState {
  // Data for each step
  generated: GenerateBookResponse | null;
  pendingResult: BulkOperationResponse | null;
  kdpGenerated: BulkOperationResponse | null;
  queue: BookQueueResponse | null;

  // UI state
  loadingStep: null |
    'generate' |
    'generatePending' |
    'generateKdpData' |
    'editKdpData' |
    'queue' |
    'uploadSingle' |
    'uploadBulk' |
    'autoGenerate';
  error: string | null;
  isKDPEditModalOpen: boolean;
  kdpEditIndex: number | null;
  kdpEditData: KdpData | null;
  polling: boolean;
}

const initialState: KdpFlowState = {
  generated: null,
  pendingResult: null,
  kdpGenerated: null,
  queue: null,
  loadingStep: null,
  error: null,
  isKDPEditModalOpen: false,
  kdpEditIndex: null,
  kdpEditData: null,
  polling: false,
};

const getErr = (e: unknown) => {
  const err = e as AxiosError<{ detail?: string; message?: string } | string>;
  if (err.response?.data) {
    const d = err.response.data as any;
    return typeof d === 'string' ? d : d.detail || d.message || 'Request failed';
  }
  return err.message || 'Network error';
};

// Thunks
export const generateBookThunk = createAsyncThunk<GenerateBookResponse, GenerateBookRequest, { rejectValue: string }>(
  'kdpFlow/generateBook',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await generateBook({ user_prompt: payload.user_prompt, n: payload.n ?? 1 });
      // Return the complete API response to preserve all data
      return res.data;
    } catch (e) {
      return rejectWithValue(getErr(e));
    }
  }
);


export const bulkGenerateKdpDataThunk = createAsyncThunk<BulkOperationResponse, { book_ids: string[]; force_regenerate?: boolean }, { rejectValue: string }>(
  'kdpFlow/bulkGenerateKdpData',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await bulkGenerateKdpData({ book_ids: payload.book_ids, force_regenerate: payload.force_regenerate });
      return res.data;
    } catch (e) {
      return rejectWithValue(getErr(e));
    }
  }
);

export const editKdpDataThunk = createAsyncThunk<BulkActionResponse, EditKdpDataPayload, { rejectValue: string }>(
  'kdpFlow/editKdpData',
  async ({ book_index, data }, { rejectWithValue }) => {
    try {
      const res = await editKdpData(book_index, data);
      return res.data;
    } catch (e) {
      return rejectWithValue(getErr(e));
    }
  }
);

export const fetchBookQueueThunk = createAsyncThunk<BookQueueResponse, void, { rejectValue: string }>(
  'kdpFlow/fetchBookQueue',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getBookQueueStatus(); // getBookQueueStatus already returns response.data
      console.log('fetchBookQueueThunk: Received data:', data);
      
      // Map service queue structure into required minimal shape
      const queue: BookQueueResponse = {
        book_queue: (data.book_queue || []).map((b: any) => ({
          id: String(b.id),
          title: b.title,
          niche: b.niche || b.genre || '',
          targetAudience: b.target_audience || '',
          wordCount: b.word_count || 0,
          status: (b.status?.toLowerCase?.() || 'pending') as BookStatus,
          kdpData: b.kdp_form_data_exists ? { title: b.title, description: b.description || '', keywords: [] } : undefined,
        })),
        processed: data.status_counts ? Object.values(data.status_counts).reduce((a: number, c: any) => a + Number(c || 0), 0) : 0,
        total: (data.book_queue || []).length,
      };
      console.log('fetchBookQueueThunk: Mapped queue:', queue);
      return queue;
    } catch (e) {
      console.error('fetchBookQueueThunk: Error:', e);
      return rejectWithValue(getErr(e));
    }
  }
);

export const uploadSingleBookThunk = createAsyncThunk<BulkOperationResponse, { book_id: string }, { rejectValue: string }>(
  'kdpFlow/uploadSingle',
  async ({ book_id }, { rejectWithValue }) => {
    try {
      await bulkUploadBooks({ books: [{ title: '', author: '', genre: '', description: '', content: '', metadata: { book_id } }] as any });
      return { success: true, processed: 1, failed: 0, errors: [], message: 'Upload triggered' } as BulkOperationResponse;
    } catch (e) {
      return rejectWithValue(getErr(e));
    }
  }
);

export const uploadBulkBooksThunk = createAsyncThunk<BulkOperationResponse, { book_ids: string[] }, { rejectValue: string }>(
  'kdpFlow/uploadBulk',
  async ({ book_ids }, { rejectWithValue }) => {
    try {
      await bulkUploadBooksWithDelay({ book_ids: book_ids.map(id => Number(id)), delay_seconds: 0 });
      return { success: true, processed: book_ids.length, failed: 0, errors: [], message: 'Bulk upload triggered' } as BulkOperationResponse;
    } catch (e) {
      return rejectWithValue(getErr(e));
    }
  }
);

export const autoGenerateBooksThunk = createAsyncThunk<GenerateBookResponse, { n: number }, { rejectValue: string }>(
  'kdpFlow/autoGenerate',
  async ({ n }, { rejectWithValue }) => {
    try {
      const res = await autoGenerateBooks({ n });
      // Return the complete API response to preserve all data
      return res.data;
    } catch (e) {
      return rejectWithValue(getErr(e));
    }
  }
);

const kdpFlowSlice = createSlice({
  name: 'kdpFlow',
  initialState,
  reducers: {
    openKDPEditModal: (state, action: PayloadAction<{ index: number; data: KdpData }>) => {
      state.isKDPEditModalOpen = true;
      state.kdpEditIndex = action.payload.index;
      state.kdpEditData = action.payload.data;
    },
    closeKDPEditModal: (state) => {
      state.isKDPEditModalOpen = false;
      state.kdpEditIndex = null;
      state.kdpEditData = null;
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.polling = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateBookThunk.pending, (state) => {
        state.loadingStep = 'generate';
        state.error = null;
      })
      .addCase(generateBookThunk.fulfilled, (state, action) => {
        state.loadingStep = null;
        state.generated = action.payload;
      })
      .addCase(generateBookThunk.rejected, (state, action) => {
        state.loadingStep = null;
        state.error = action.payload || 'Failed to generate book';
      })
      .addCase(bulkGenerateKdpDataThunk.pending, (state) => {
        state.loadingStep = 'generateKdpData';
        state.error = null;
      })
      .addCase(bulkGenerateKdpDataThunk.fulfilled, (state, action) => {
        state.loadingStep = null;
        state.kdpGenerated = action.payload;
      })
      .addCase(bulkGenerateKdpDataThunk.rejected, (state, action) => {
        state.loadingStep = null;
        state.error = action.payload || 'Failed to generate KDP data';
      })
      .addCase(editKdpDataThunk.pending, (state) => {
        state.loadingStep = 'editKdpData';
        state.error = null;
      })
      .addCase(editKdpDataThunk.fulfilled, (state) => {
        state.loadingStep = null;
        state.isKDPEditModalOpen = false;
      })
      .addCase(editKdpDataThunk.rejected, (state, action) => {
        state.loadingStep = null;
        state.error = action.payload || 'Failed to edit KDP data';
      })
      .addCase(fetchBookQueueThunk.pending, (state) => {
        state.loadingStep = 'queue';
      })
      .addCase(fetchBookQueueThunk.fulfilled, (state, action) => {
        state.loadingStep = null;
        state.queue = action.payload;
      })
      .addCase(fetchBookQueueThunk.rejected, (state, action) => {
        state.loadingStep = null;
        state.error = action.payload || 'Failed to fetch queue';
      })
      .addCase(uploadSingleBookThunk.pending, (state) => {
        state.loadingStep = 'uploadSingle';
      })
      .addCase(uploadSingleBookThunk.fulfilled, (state) => {
        state.loadingStep = null;
      })
      .addCase(uploadSingleBookThunk.rejected, (state, action) => {
        state.loadingStep = null;
        state.error = action.payload || 'Failed to upload book';
      })
      .addCase(uploadBulkBooksThunk.pending, (state) => {
        state.loadingStep = 'uploadBulk';
      })
      .addCase(uploadBulkBooksThunk.fulfilled, (state) => {
        state.loadingStep = null;
      })
      .addCase(uploadBulkBooksThunk.rejected, (state, action) => {
        state.loadingStep = null;
        state.error = action.payload || 'Failed to bulk upload books';
      })
      .addCase(autoGenerateBooksThunk.pending, (state) => {
        state.loadingStep = 'autoGenerate';
      })
      .addCase(autoGenerateBooksThunk.fulfilled, (state, action) => {
        state.loadingStep = null;
        state.generated = action.payload;
      })
      .addCase(autoGenerateBooksThunk.rejected, (state, action) => {
        state.loadingStep = null;
        state.error = action.payload || 'Failed to auto-generate books';
      });
  },
});

export const { openKDPEditModal, closeKDPEditModal, setPolling } = kdpFlowSlice.actions;

export default kdpFlowSlice.reducer;

// Selectors
export const selectKdpFlow = (state: any) => state.kdpFlow as KdpFlowState;
export const selectKdpQueue = (state: any) => (state.kdpFlow as KdpFlowState).queue;

