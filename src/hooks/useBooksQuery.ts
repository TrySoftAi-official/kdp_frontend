import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBooksApi } from './useBooksApi';
import { queryKeys } from '@/utils/queryClient';
import { 
  BookGenerationRequest, 
  BookUpdate, 
  BookFilter, 
  BookSort,
  BookPrompt,
  BookPromptCreate,
  BookPromptUpdate
} from '@/services/bookService';

export const useBooksQuery = () => {
  const booksApi = useBooksApi();
  const queryClient = useQueryClient();

  // Get books list query
  const useBooks = (page: number = 1, limit: number = 10, filters?: BookFilter, sort?: BookSort) => {
    return useQuery({
      queryKey: queryKeys.books.all(page, limit, filters, sort),
      queryFn: () => booksApi.getBooks(page, limit, filters, sort),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get single book query
  const useBook = (bookId: string) => {
    return useQuery({
      queryKey: queryKeys.books.detail(bookId),
      queryFn: () => booksApi.getBook(bookId),
      enabled: !!bookId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get genres query
  const useGenres = () => {
    return useQuery({
      queryKey: queryKeys.books.genres,
      queryFn: () => booksApi.getGenres(),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  // Get hot selling genres query
  const useHotSellingGenres = (limit: number = 10) => {
    return useQuery({
      queryKey: queryKeys.books.hotSellingGenres(limit),
      queryFn: () => booksApi.getHotSellingGenres(limit),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get niches query
  const useNiches = () => {
    return useQuery({
      queryKey: queryKeys.books.niches,
      queryFn: () => booksApi.getNiches(),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  // Get popular niches query
  const usePopularNiches = (limit: number = 10) => {
    return useQuery({
      queryKey: queryKeys.books.popularNiches(limit),
      queryFn: () => booksApi.getPopularNiches(limit),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Get book suggestions query
  const useBookSuggestions = (limit: number = 10) => {
    return useQuery({
      queryKey: queryKeys.books.suggestions(limit),
      queryFn: () => booksApi.getBookSuggestions(limit),
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  // Get suggestions by genre query
  const useSuggestionsByGenre = (genre: string, limit: number = 10) => {
    return useQuery({
      queryKey: queryKeys.books.suggestionsByGenre(genre, limit),
      queryFn: () => booksApi.getSuggestionsByGenre(genre, limit),
      enabled: !!genre,
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  // Get suggestions by niche query
  const useSuggestionsByNiche = (niche: string, limit: number = 10) => {
    return useQuery({
      queryKey: queryKeys.books.suggestionsByNiche(niche, limit),
      queryFn: () => booksApi.getSuggestionsByNiche(niche, limit),
      enabled: !!niche,
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  // Get book analytics query
  const useBookAnalytics = (bookId: string, period: string = '30d') => {
    return useQuery({
      queryKey: queryKeys.books.analytics(bookId, period),
      queryFn: () => booksApi.getBookAnalytics(bookId, period),
      enabled: !!bookId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get books analytics query
  const useBooksAnalytics = (period: string = '30d') => {
    return useQuery({
      queryKey: queryKeys.books.analytics(undefined, period),
      queryFn: () => booksApi.getBooksAnalytics(period),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get book templates query
  const useBookTemplates = () => {
    return useQuery({
      queryKey: queryKeys.books.templates,
      queryFn: () => booksApi.getBookTemplates(),
      staleTime: 60 * 60 * 1000, // 1 hour
    });
  };

  // Get book template query
  const useBookTemplate = (templateId: string) => {
    return useQuery({
      queryKey: queryKeys.books.template(templateId),
      queryFn: () => booksApi.getBookTemplate(templateId),
      enabled: !!templateId,
      staleTime: 60 * 60 * 1000, // 1 hour
    });
  };

  // Get generation status query
  const useGenerationStatus = (generationId: string) => {
    return useQuery({
      queryKey: queryKeys.books.generationStatus(generationId),
      queryFn: () => booksApi.getGenerationStatus(generationId),
      enabled: !!generationId,
      staleTime: 0, // Always fresh for generation status
      refetchInterval: (data) => {
        // Stop polling if generation is completed or failed
        if (data?.status === 'completed' || data?.status === 'failed') {
          return false;
        }
        // Poll every 2 seconds for active generations
        return 2000;
      },
    });
  };

  // Get book prompts query
  const useBookPrompts = (page: number = 1, limit: number = 10) => {
    return useQuery({
      queryKey: ['books', 'prompts', page, limit],
      queryFn: () => booksApi.getBookPrompts(page, limit),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get book prompt query
  const useBookPrompt = (promptId: string) => {
    return useQuery({
      queryKey: ['books', 'prompts', promptId],
      queryFn: () => booksApi.getBookPrompt(promptId),
      enabled: !!promptId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create book mutation
  const useCreateBook = () => {
    return useMutation({
      mutationFn: (data: BookGenerationRequest) => booksApi.createBook(data),
      onSuccess: () => {
        // Invalidate books list
        queryClient.invalidateQueries({ queryKey: queryKeys.books.all() });
      },
    });
  };

  // Update book mutation
  const useUpdateBook = () => {
    return useMutation({
      mutationFn: ({ bookId, data }: { bookId: string; data: BookUpdate }) => 
        booksApi.updateBook(bookId, data),
      onSuccess: (_, { bookId }) => {
        // Invalidate specific book and books list
        queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(bookId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.books.all() });
      },
    });
  };

  // Delete book mutation
  const useDeleteBook = () => {
    return useMutation({
      mutationFn: (bookId: string) => booksApi.deleteBook(bookId),
      onSuccess: (_, bookId) => {
        // Remove book from cache and invalidate list
        queryClient.removeQueries({ queryKey: queryKeys.books.detail(bookId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.books.all() });
      },
    });
  };

  // Generate book mutation
  const useGenerateBook = () => {
    return useMutation({
      mutationFn: (data: BookGenerationRequest) => booksApi.generateBook(data),
      onSuccess: () => {
        // Invalidate books list
        queryClient.invalidateQueries({ queryKey: queryKeys.books.all() });
      },
    });
  };

  // Cancel generation mutation
  const useCancelGeneration = () => {
    return useMutation({
      mutationFn: (generationId: string) => booksApi.cancelGeneration(generationId),
      onSuccess: (_, generationId) => {
        // Invalidate generation status
        queryClient.invalidateQueries({ queryKey: queryKeys.books.generationStatus(generationId) });
      },
    });
  };

  // Publish book mutation
  const usePublishBook = () => {
    return useMutation({
      mutationFn: ({ bookId, platform }: { bookId: string; platform?: string }) => 
        booksApi.publishBook(bookId, platform),
      onSuccess: (_, { bookId }) => {
        // Invalidate specific book and books list
        queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(bookId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.books.all() });
      },
    });
  };

  // Unpublish book mutation
  const useUnpublishBook = () => {
    return useMutation({
      mutationFn: (bookId: string) => booksApi.unpublishBook(bookId),
      onSuccess: (_, bookId) => {
        // Invalidate specific book and books list
        queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(bookId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.books.all() });
      },
    });
  };

  // Export book mutation
  const useExportBook = () => {
    return useMutation({
      mutationFn: ({ bookId, format }: { bookId: string; format: 'pdf' | 'epub' | 'mobi' | 'docx' }) => 
        booksApi.exportBook(bookId, format),
    });
  };

  // Create book prompt mutation
  const useCreateBookPrompt = () => {
    return useMutation({
      mutationFn: (data: BookPromptCreate) => booksApi.createBookPrompt(data),
      onSuccess: () => {
        // Invalidate book prompts list
        queryClient.invalidateQueries({ queryKey: ['books', 'prompts'] });
      },
    });
  };

  // Update book prompt mutation
  const useUpdateBookPrompt = () => {
    return useMutation({
      mutationFn: ({ promptId, data }: { promptId: string; data: BookPromptUpdate }) => 
        booksApi.updateBookPrompt(promptId, data),
      onSuccess: (_, { promptId }) => {
        // Invalidate specific prompt and prompts list
        queryClient.invalidateQueries({ queryKey: ['books', 'prompts', promptId] });
        queryClient.invalidateQueries({ queryKey: ['books', 'prompts'] });
      },
    });
  };

  // Delete book prompt mutation
  const useDeleteBookPrompt = () => {
    return useMutation({
      mutationFn: (promptId: string) => booksApi.deleteBookPrompt(promptId),
      onSuccess: (_, promptId) => {
        // Remove prompt from cache and invalidate list
        queryClient.removeQueries({ queryKey: ['books', 'prompts', promptId] });
        queryClient.invalidateQueries({ queryKey: ['books', 'prompts'] });
      },
    });
  };

  return {
    // Queries
    useBooks,
    useBook,
    useGenres,
    useHotSellingGenres,
    useNiches,
    usePopularNiches,
    useBookSuggestions,
    useSuggestionsByGenre,
    useSuggestionsByNiche,
    useBookAnalytics,
    useBooksAnalytics,
    useBookTemplates,
    useBookTemplate,
    useGenerationStatus,
    useBookPrompts,
    useBookPrompt,
    
    // Mutations
    useCreateBook,
    useUpdateBook,
    useDeleteBook,
    useGenerateBook,
    useCancelGeneration,
    usePublishBook,
    useUnpublishBook,
    useExportBook,
    useCreateBookPrompt,
    useUpdateBookPrompt,
    useDeleteBookPrompt,
  };
};
