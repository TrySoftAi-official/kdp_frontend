import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  generateBook,
  getGenerationStatus,
  getBookSuggestions,
  getGenres,
  getNiches,
  getBookAnalytics,
  uploadBooksCSV,
  retryBookPublication,
  getBookPrompts,
  createBookPrompt,
  updateBookPrompt,
  deleteBookPrompt,
  Book, 
  BookGenerationRequest, 
  BookGenerationResponse,
  BookUpdate,
  BookFilter,
  BookSort,
  PaginatedBooksResponse,
  BookSuggestion,
  Genre,
  Niche,
  BookAnalytics,
  BookPrompt
} from '../../apis/books';
import { getErrorMessage } from '../../apis/apiClient';

// Book state interface
interface BookState {
  // Data
  books: Book[];
  currentBook: Book | null;
  bookPrompts: BookPrompt[];
  suggestions: BookSuggestion[];
  genres: Genre[];
  niches: Niche[];
  analytics: BookAnalytics | null;
  
  // Pagination
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  
  // Filters and sorting
  filters: BookFilter | null;
  sort: BookSort | null;
  
  // Generation
  generationStatus: BookGenerationResponse | null;
  generationSteps: any[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isGenerating: boolean;
  isUploading: boolean;
  
  // Error state
  error: string | null;
}

// Initial state
const initialState: BookState = {
  books: [],
  currentBook: null,
  bookPrompts: [],
  suggestions: [],
  genres: [],
  niches: [],
  analytics: null,
  
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  
  filters: null,
  sort: null,
  
  generationStatus: null,
  generationSteps: [],
  
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isGenerating: false,
  isUploading: false,
  
  error: null,
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async ({ 
    filters, 
    sort, 
    page = 1, 
    limit = 10 
  }: { 
    filters?: BookFilter; 
    sort?: BookSort; 
    page?: number; 
    limit?: number; 
  }, { rejectWithValue }) => {
    try {
      const data = await getBooks(filters, sort, page, limit);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBook = createAsyncThunk(
  'books/fetchBook',
  async (bookId: string, { rejectWithValue }) => {
    try {
      const data = await getBook(bookId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBookThunk = createAsyncThunk(
  'books/createBook',
  async (data: Partial<Book>, { rejectWithValue }) => {
    try {
      const result = await createBook(data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBookThunk = createAsyncThunk(
  'books/updateBook',
  async ({ bookId, data }: { bookId: string; data: BookUpdate }, { rejectWithValue }) => {
    try {
      const result = await updateBook(bookId, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBookThunk = createAsyncThunk(
  'books/deleteBook',
  async (bookId: string, { rejectWithValue }) => {
    try {
      const result = await deleteBook(bookId);
      return { bookId, message: result.message };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateBook = createAsyncThunk(
  'books/generateBook',
  async (data: BookGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await BookService.generateBook(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchGenerationStatus = createAsyncThunk(
  'books/fetchGenerationStatus',
  async (bookId: string, { rejectWithValue }) => {
    try {
      const response = await BookService.getGenerationStatus(bookId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchBookSuggestions = createAsyncThunk(
  'books/fetchSuggestions',
  async ({ genre, limit = 10 }: { genre?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await BookService.getBookSuggestions(genre, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchGenres = createAsyncThunk(
  'books/fetchGenres',
  async (_, { rejectWithValue }) => {
    try {
      const response = await BookService.getGenres();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchNiches = createAsyncThunk(
  'books/fetchNiches',
  async (genre?: string, { rejectWithValue }) => {
    try {
      const response = await BookService.getNiches(genre);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchBookAnalytics = createAsyncThunk(
  'books/fetchAnalytics',
  async ({ bookId, period = '30d' }: { bookId: string; period?: string }, { rejectWithValue }) => {
    try {
      const response = await BookService.getBookAnalytics(bookId, period);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const uploadBooksCSV = createAsyncThunk(
  'books/uploadCSV',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await BookService.uploadBooksCSV(file);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const retryBookPublication = createAsyncThunk(
  'books/retryPublication',
  async (bookId: string, { rejectWithValue }) => {
    try {
      const response = await BookService.retryBookPublication(bookId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchBookPrompts = createAsyncThunk(
  'books/fetchPrompts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await BookService.getBookPrompts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createBookPrompt = createAsyncThunk(
  'books/createPrompt',
  async (data: Partial<BookPrompt>, { rejectWithValue }) => {
    try {
      const response = await BookService.createBookPrompt(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateBookPrompt = createAsyncThunk(
  'books/updatePrompt',
  async ({ promptId, data }: { promptId: string; data: Partial<BookPrompt> }, { rejectWithValue }) => {
    try {
      const response = await BookService.updateBookPrompt(promptId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteBookPrompt = createAsyncThunk(
  'books/deletePrompt',
  async (promptId: string, { rejectWithValue }) => {
    try {
      const response = await BookService.deleteBookPrompt(promptId);
      return { promptId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Book slice
const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBooks: (state) => {
      state.books = [];
      state.currentBook = null;
      state.total = 0;
      state.page = 1;
      state.totalPages = 0;
    },
    setFilters: (state, action: PayloadAction<BookFilter>) => {
      state.filters = action.payload;
    },
    setSort: (state, action: PayloadAction<BookSort>) => {
      state.sort = action.payload;
    },
    clearFilters: (state) => {
      state.filters = null;
      state.sort = null;
    },
    clearGenerationStatus: (state) => {
      state.generationStatus = null;
      state.generationSteps = [];
    },
    updateBookLocal: (state, action: PayloadAction<{ bookId: string; updates: Partial<Book> }>) => {
      const { bookId, updates } = action.payload;
      const bookIndex = state.books.findIndex(book => book.id === bookId);
      if (bookIndex !== -1) {
        state.books[bookIndex] = { ...state.books[bookIndex], ...updates };
      }
      if (state.currentBook?.id === bookId) {
        state.currentBook = { ...state.currentBook, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch books
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.books;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.total_pages;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single book
      .addCase(fetchBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBook = action.payload;
        state.error = null;
      })
      .addCase(fetchBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create book
      .addCase(createBookThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBookThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.books.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createBookThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      
      // Update book
      .addCase(updateBookThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBookThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const bookIndex = state.books.findIndex(book => book.id === action.payload.id);
        if (bookIndex !== -1) {
          state.books[bookIndex] = action.payload;
        }
        if (state.currentBook?.id === action.payload.id) {
          state.currentBook = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBookThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      
      // Delete book
      .addCase(deleteBookThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBookThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.books = state.books.filter(book => book.id !== action.payload.bookId);
        state.total -= 1;
        if (state.currentBook?.id === action.payload.bookId) {
          state.currentBook = null;
        }
        state.error = null;
      })
      .addCase(deleteBookThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })
      
      // Generate book
      .addCase(generateBook.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateBook.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generationStatus = action.payload;
        state.error = null;
      })
      .addCase(generateBook.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      
      // Fetch generation status
      .addCase(fetchGenerationStatus.fulfilled, (state, action) => {
        state.generationSteps = action.payload.steps;
        if (state.generationStatus) {
          state.generationStatus.progress = action.payload.progress;
          state.generationStatus.status = action.payload.status;
        }
      })
      
      // Fetch suggestions
      .addCase(fetchBookSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })
      
      // Fetch genres
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.genres = action.payload;
      })
      
      // Fetch niches
      .addCase(fetchNiches.fulfilled, (state, action) => {
        state.niches = action.payload;
      })
      
      // Fetch analytics
      .addCase(fetchBookAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      
      // Upload CSV
      .addCase(uploadBooksCSV.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadBooksCSV.fulfilled, (state) => {
        state.isUploading = false;
        state.error = null;
      })
      .addCase(uploadBooksCSV.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      })
      
      // Retry publication
      .addCase(retryBookPublication.fulfilled, (state, action) => {
        const bookIndex = state.books.findIndex(book => book.id === action.payload.id);
        if (bookIndex !== -1) {
          state.books[bookIndex] = action.payload;
        }
        if (state.currentBook?.id === action.payload.id) {
          state.currentBook = action.payload;
        }
      })
      
      // Fetch prompts
      .addCase(fetchBookPrompts.fulfilled, (state, action) => {
        state.bookPrompts = action.payload;
      })
      
      // Create prompt
      .addCase(createBookPrompt.fulfilled, (state, action) => {
        state.bookPrompts.unshift(action.payload);
      })
      
      // Update prompt
      .addCase(updateBookPrompt.fulfilled, (state, action) => {
        const promptIndex = state.bookPrompts.findIndex(prompt => prompt.id === action.payload.id);
        if (promptIndex !== -1) {
          state.bookPrompts[promptIndex] = action.payload;
        }
      })
      
      // Delete prompt
      .addCase(deleteBookPrompt.fulfilled, (state, action) => {
        state.bookPrompts = state.bookPrompts.filter(prompt => prompt.id !== action.payload.promptId);
      });
  },
});

export const { 
  clearError, 
  clearBooks, 
  setFilters, 
  setSort, 
  clearFilters, 
  clearGenerationStatus,
  updateBookLocal 
} = bookSlice.actions;

// Selectors
export const selectBookState = (state: { books: BookState }) => state.books;
export const selectBooks = (state: { books: BookState }) => state.books.books;
export const selectCurrentBook = (state: { books: BookState }) => state.books.currentBook;
export const selectBookPrompts = (state: { books: BookState }) => state.books.bookPrompts;
export const selectBookGenres = (state: { books: BookState }) => state.books.genres;
export const selectBookNiches = (state: { books: BookState }) => state.books.niches;
export const selectBookAnalytics = (state: { books: BookState }) => state.books.analytics;
export const selectGenerationStatus = (state: { books: BookState }) => state.books.generationStatus;

export default bookSlice.reducer;
