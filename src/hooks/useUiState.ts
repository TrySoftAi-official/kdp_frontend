import { useState, useEffect, useCallback } from 'react';

export interface UseUiStateReturn {
  // Modal States
  showAutoGenerateModal: boolean;
  showKdpEditModal: boolean;
  showKDPCredentialsModal: boolean;
  showBookView: boolean;
  
  // Dropdown States
  showDropdown: string | null;
  selectedBookForDropdown: any | null;
  
  // Selection States
  selectedBook: any | null;
  selectedBookForEdit: any | null;
  
  // Form States
  modalNumberOfBooks: number;
  
  // Drag States
  isDragging: boolean;
  dragStart: number;
  dragOffset: number;
  animationPaused: boolean;
  
  // Actions
  setShowAutoGenerateModal: (show: boolean) => void;
  setShowKdpEditModal: (show: boolean) => void;
  setShowKDPCredentialsModal: (show: boolean) => void;
  setShowBookView: (show: boolean) => void;
  
  // Dropdown Actions
  handleViewDropdown: (book: any, event: React.MouseEvent) => void;
  closeDropdown: () => void;
  
  // Selection Actions
  setSelectedBook: (book: any | null) => void;
  setSelectedBookForEdit: (book: any | null) => void;
  
  // Form Actions
  setModalNumberOfBooks: (number: number) => void;
  
  // Drag Actions
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  
  // Utility Actions
  closeBookView: () => void;
  handleViewGeneratedBook: (book: any) => void;
  handlePreviewSuggestion: (suggestion: any) => void;
}

export const useUiState = (): UseUiStateReturn => {
  // Modal states
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
  const [showKdpEditModal, setShowKdpEditModal] = useState(false);
  const [showKDPCredentialsModal, setShowKDPCredentialsModal] = useState(false);
  const [showBookView, setShowBookView] = useState(false);
  
  // Dropdown states
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedBookForDropdown, setSelectedBookForDropdown] = useState<any | null>(null);
  
  // Selection states
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<any | null>(null);
  
  // Form states
  const [modalNumberOfBooks, setModalNumberOfBooks] = useState<number>(3);
  
  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);

  // Handle view dropdown
  const handleViewDropdown = useCallback((book: any, event: React.MouseEvent) => {
    event.stopPropagation();
    if (showDropdown === book.id) {
      setShowDropdown(null);
      setSelectedBookForDropdown(null);
    } else {
      // Close any other open dropdown first
      setShowDropdown(book.id);
      setSelectedBookForDropdown(book);

      // Ensure the dropdown is visible by scrolling if needed
      setTimeout(() => {
        const dropdownElement = document.querySelector(`[data-dropdown="${book.id}"]`);
        if (dropdownElement) {
          dropdownElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [showDropdown]);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setShowDropdown(null);
    setSelectedBookForDropdown(null);
  }, []);

  // Close book view
  const closeBookView = useCallback(() => {
    setShowBookView(false);
    setSelectedBook(null);
  }, []);

  // Handle view generated book
  const handleViewGeneratedBook = useCallback((book: any) => {
    setSelectedBook(book);
    setShowBookView(true);
  }, []);

  // Handle preview suggestion
  const handlePreviewSuggestion = useCallback((suggestion: any) => {
    // Show preview modal with suggestion details
    setSelectedBook({
      id: 'preview',
      title: suggestion.title,
      content: `This is a preview of "${suggestion.title}" - ${suggestion.description}\n\nNiche: ${suggestion.niche}\nTarget Audience: ${suggestion.targetAudience}\n\nPrompt: ${suggestion.prompt}`,
      coverUrl: `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(suggestion.title)}`,
      niche: suggestion.niche,
      targetAudience: suggestion.targetAudience,
      wordCount: 5000, // Default word count
      createdAt: new Date().toISOString(),
      status: 'Pending' as const
    });
    setShowBookView(true);
  }, []);

  // Drag handlers for slider
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX - dragOffset);
    setAnimationPaused(true);
    e.preventDefault();
  }, [dragOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffset = e.clientX - dragStart;
    setDragOffset(newOffset);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setAnimationPaused(false);
    // Reset offset after a short delay to resume animation
    setTimeout(() => {
      setDragOffset(0);
    }, 100);
  }, []);

  // Touch handlers for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX - dragOffset);
    setAnimationPaused(true);
  }, [dragOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const newOffset = e.touches[0].clientX - dragStart;
    setDragOffset(newOffset);
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setAnimationPaused(false);
    // Reset offset after a short delay to resume animation
    setTimeout(() => {
      setDragOffset(0);
    }, 100);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, closeDropdown]);

  return {
    // Modal States
    showAutoGenerateModal,
    showKdpEditModal,
    showKDPCredentialsModal,
    showBookView,
    
    // Dropdown States
    showDropdown,
    selectedBookForDropdown,
    
    // Selection States
    selectedBook,
    selectedBookForEdit,
    
    // Form States
    modalNumberOfBooks,
    
    // Drag States
    isDragging,
    dragStart,
    dragOffset,
    animationPaused,
    
    // Actions
    setShowAutoGenerateModal,
    setShowKdpEditModal,
    setShowKDPCredentialsModal,
    setShowBookView,
    
    // Dropdown Actions
    handleViewDropdown,
    closeDropdown,
    
    // Selection Actions
    setSelectedBook,
    setSelectedBookForEdit,
    
    // Form Actions
    setModalNumberOfBooks,
    
    // Drag Actions
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Utility Actions
    closeBookView,
    handleViewGeneratedBook,
    handlePreviewSuggestion
  };
};
