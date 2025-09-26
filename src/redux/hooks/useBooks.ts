import { useAppDispatch, useAppSelector } from '../hooks';
import { 
  fetchBooks,
  fetchBook,
  createBookThunk,
  updateBookThunk,
  deleteBookThunk,
  generateBook,
  fetchGenerationStatus,
  fetchBookSuggestions,
  fetchGenres,
  fetchNiches,
  fetchBookAnalytics,
  uploadBooksCSV,
  retryBookPublication,
  fetchBookPrompts,
  createBookPrompt,
  updateBookPrompt,
  deleteBookPrompt,
  clearError,
  clearBooks,
  setFilters,
  setSort,
  clearFilters,
  clearGenerationStatus,
  updateBookLocal
} from '../slices/bookSlice';

export const useBooks = () => {
  const dispatch = useAppDispatch();
  const bookState = useAppSelector((state) => state.books);

  // Book CRUD actions
  const fetchBooksList = async (filters?: any, sort?: any, page = 1, limit = 10) => {
    return dispatch(fetchBooks({ filters, sort, page, limit }));
  };

  const fetchSingleBook = async (bookId: string) => {
    return dispatch(fetchBook(bookId));
  };

  const createNewBook = async (data: any) => {
    return dispatch(createBookThunk(data));
  };

  const updateExistingBook = async (bookId: string, data: any) => {
    return dispatch(updateBookThunk({ bookId, data }));
  };

  const deleteExistingBook = async (bookId: string) => {
    return dispatch(deleteBookThunk(bookId));
  };

  // Book generation actions
  const generateNewBook = async (data: any) => {
    return dispatch(generateBook(data));
  };

  const fetchGenStatus = async (bookId: string) => {
    return dispatch(fetchGenerationStatus(bookId));
  };

  // Book data actions
  const fetchSuggestions = async (genre?: string, limit = 10) => {
    return dispatch(fetchBookSuggestions({ genre, limit }));
  };

  const fetchGenresList = async () => {
    return dispatch(fetchGenres());
  };

  const fetchNichesList = async (genre?: string) => {
    return dispatch(fetchNiches(genre));
  };

  const fetchAnalytics = async (bookId: string, period = '30d') => {
    return dispatch(fetchBookAnalytics({ bookId, period }));
  };

  // File operations
  const uploadCSV = async (file: File) => {
    return dispatch(uploadBooksCSV(file));
  };

  const retryPublication = async (bookId: string) => {
    return dispatch(retryBookPublication(bookId));
  };

  // Book prompts actions
  const fetchPrompts = async () => {
    return dispatch(fetchBookPrompts());
  };

  const createPrompt = async (data: any) => {
    return dispatch(createBookPrompt(data));
  };

  const updatePrompt = async (promptId: string, data: any) => {
    return dispatch(updateBookPrompt({ promptId, data }));
  };

  const deletePrompt = async (promptId: string) => {
    return dispatch(deleteBookPrompt(promptId));
  };

  // Utility actions
  const clearBookError = () => {
    dispatch(clearError());
  };

  const clearBooksData = () => {
    dispatch(clearBooks());
  };

  const setBookFilters = (filters: any) => {
    dispatch(setFilters(filters));
  };

  const setBookSort = (sort: any) => {
    dispatch(setSort(sort));
  };

  const clearBookFilters = () => {
    dispatch(clearFilters());
  };

  const clearGenStatus = () => {
    dispatch(clearGenerationStatus());
  };

  const updateBookLocally = (bookId: string, updates: any) => {
    dispatch(updateBookLocal({ bookId, updates }));
  };

  return {
    // State
    books: bookState.books,
    currentBook: bookState.currentBook,
    bookPrompts: bookState.bookPrompts,
    suggestions: bookState.suggestions,
    genres: bookState.genres,
    niches: bookState.niches,
    analytics: bookState.analytics,
    
    // Pagination
    total: bookState.total,
    page: bookState.page,
    limit: bookState.limit,
    totalPages: bookState.totalPages,
    
    // Filters and sorting
    filters: bookState.filters,
    sort: bookState.sort,
    
    // Generation
    generationStatus: bookState.generationStatus,
    generationSteps: bookState.generationSteps,
    
    // Loading states
    isLoading: bookState.isLoading,
    isCreating: bookState.isCreating,
    isUpdating: bookState.isUpdating,
    isDeleting: bookState.isDeleting,
    isGenerating: bookState.isGenerating,
    isUploading: bookState.isUploading,
    
    // Error state
    error: bookState.error,
    
    // Actions
    fetchBooksList,
    fetchSingleBook,
    createNewBook,
    updateExistingBook,
    deleteExistingBook,
    generateNewBook,
    fetchGenStatus,
    fetchSuggestions,
    fetchGenresList,
    fetchNichesList,
    fetchAnalytics,
    uploadCSV,
    retryPublication,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    clearBookError,
    clearBooksData,
    setBookFilters,
    setBookSort,
    clearBookFilters,
    clearGenStatus,
    updateBookLocally,
  };
};
