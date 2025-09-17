// import React from 'react';
// import { CreateBook as CreateBookComponent } from '@/components/create-book';

// export const CreateBook: React.FC = () => {
//   return <CreateBookComponent />;
// };



import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  FileText, 
  Image, 
  Sparkles, 
  Download, 
  Play,
  Save,
  Eye,
  Settings,
  Target,
  Users,
  TrendingUp,
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionIntegration } from '@/hooks/useSubscriptionIntegration';
import { toast } from '@/lib/toast';
import { BookCreationGuard } from '@/components/subscription/SubscriptionGuard';
import { CheckoutModal } from '@/components/subscription/CheckoutModal';
import { 
  AdditionalService, 
  Book as ApiBook,
  BooksResponse
} from '@/api/additionalService';

interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  result?: string;
}

interface GeneratedBook {
  id: string;
  title: string;
  content: string;
  coverUrl: string;
  niche: string;
  targetAudience: string;
  wordCount: number;
  createdAt: string;
  status: 'draft' | 'generated' | 'published';
}

interface CSVBookData {
  title: string;
  prompt: string;
  niche: string;
  targetAudience: string;
  wordCount: string;
  keywords?: string;
  description?: string;
}

export const CreateBook: React.FC = () => {
  const { user } = useAuth();
  const subscriptionIntegration = useSubscriptionIntegration();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVBookData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generatedBooks, setGeneratedBooks] = useState<GeneratedBook[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<GeneratedBook | null>(null);
  const [showBookView, setShowBookView] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedBookForDropdown, setSelectedBookForDropdown] = useState<GeneratedBook | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // API books state
  const [apiBooks, setApiBooks] = useState<ApiBook[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [booksError, setBooksError] = useState<string>('');
  const [showApiBooks, setShowApiBooks] = useState(false);

  // Check if user needs to upgrade
  useEffect(() => {
    if (user?.role === 'guest') {
      setShowUpgradeModal(true);
    } else if (user) {
      setShowUpgradeModal(false);
    }
  }, [user]);

  // Fetch books from API
  const fetchBooks = async () => {
    setIsLoadingBooks(true);
    setBooksError('');
    try {
      const response = await AdditionalService.getBooks(1, 20); // Get first 20 books
      if (response?.data?.books) {
        setApiBooks(response.data.books);
      }
    } catch (error: any) {
      console.error('Error fetching books:', error);
      setBooksError(error.response?.data?.message || error.message || 'Failed to fetch books');
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // Load books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Sample books for visual demonstration
  const sampleBooks: GeneratedBook[] = [
    {
      id: 'sample-1',
      title: 'The Complete Guide to Healthy Eating',
      content: 'A comprehensive guide to maintaining a healthy diet...',
      coverUrl: 'https://via.placeholder.com/400x600/10B981/FFFFFF?text=Healthy+Eating+Guide',
      niche: 'Health & Fitness',
      targetAudience: 'Beginners',
      wordCount: 8500,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'generated'
    },
    {
      id: 'sample-2',
      title: 'Business Success Blueprint',
      content: 'Essential strategies for building a successful business...',
      coverUrl: 'https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=Business+Success',
      niche: 'Business & Entrepreneurship',
      targetAudience: 'Entrepreneurs',
      wordCount: 12000,
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: 'generated'
    },
    {
      id: 'sample-3',
      title: 'Mindful Parenting Techniques',
      content: 'Modern approaches to raising happy and confident children...',
      coverUrl: 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=Mindful+Parenting',
      niche: 'Parenting & Family',
      targetAudience: 'Parents',
      wordCount: 6500,
      createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      status: 'generated'
    },
    {
      id: 'sample-4',
      title: 'Digital Marketing Mastery',
      content: 'Complete guide to modern digital marketing strategies...',
      coverUrl: 'https://via.placeholder.com/400x600/F59E0B/FFFFFF?text=Digital+Marketing',
      niche: 'Business & Entrepreneurship',
      targetAudience: 'Professionals',
      wordCount: 9500,
      createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      status: 'generated'
    },
    {
      id: 'sample-5',
      title: 'Quick & Easy Recipes for Busy Families',
      content: 'Delicious meals that can be prepared in 30 minutes or less...',
      coverUrl: 'https://via.placeholder.com/400x600/EF4444/FFFFFF?text=Quick+Recipes',
      niche: 'Cooking & Recipes',
      targetAudience: 'Parents',
      wordCount: 7200,
      createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      status: 'generated'
    },
    {
      id: 'sample-6',
      title: 'Financial Freedom Roadmap',
      content: 'Step-by-step guide to achieving financial independence...',
      coverUrl: 'https://via.placeholder.com/400x600/059669/FFFFFF?text=Financial+Freedom',
      niche: 'Finance & Investment',
      targetAudience: 'Young Adults',
      wordCount: 8800,
      createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
      status: 'generated'
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadError('Please upload a valid CSV file');
      return;
    }

    setCsvFile(file);
    setUploadError('');
    processCSVFile(file);
  };

  const processCSVFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        setUploadError('CSV file must contain at least a header row and one data row. Please follow the template format.');
        setIsProcessing(false);
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Check if required headers are present
      const requiredHeaders = ['title', 'prompt', 'niche', 'targetaudience'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        setUploadError(`Missing required columns: ${missingHeaders.join(', ')}. Please follow the CSV template format.`);
        setIsProcessing(false);
        return;
      }
      
      const data: CSVBookData[] = [];
      const errors: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Validate required fields
          const missingFields: string[] = [];
          if (!row.title) missingFields.push('title');
          if (!row.prompt) missingFields.push('prompt');
          if (!row.niche) missingFields.push('niche');
          if (!row.targetaudience) missingFields.push('target audience');
          
          if (missingFields.length > 0) {
            errors.push(`Row ${i + 1}: Missing required fields: ${missingFields.join(', ')}`);
          } else {
            data.push({
              title: row.title,
              prompt: row.prompt,
              niche: row.niche,
              targetAudience: row.targetaudience,
              wordCount: row.wordcount || '5000',
              keywords: row.keywords || '',
              description: row.description || ''
            });
          }
        }
      }
      
      if (errors.length > 0) {
        const errorMessage = `Incorrect data entered. Please follow the template format.\n\nErrors found:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ''}`;
        setUploadError(errorMessage);
        setCsvData([]);
      } else if (data.length === 0) {
        setUploadError('No valid data rows found. Please ensure your CSV contains at least one row with all required fields.');
        setCsvData([]);
      } else {
        setUploadError('');
        setCsvData(data);
      }
      
      setIsProcessing(false);
    };
    
    reader.onerror = () => {
      setUploadError('Failed to read the CSV file. Please try again.');
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  const handleGenerateAll = async () => {
    if (csvData.length === 0) {
      alert('Please upload a CSV file with book data first');
      return;
    }

    setIsGenerating(true);
    setGeneratedBooks([]);
    setCurrentBookIndex(0);

    // Initialize generation steps
    const steps: GenerationStep[] = [
      { id: '1', name: 'Analyzing CSV data', status: 'pending', progress: 0 },
      { id: '2', name: 'Generating book outlines', status: 'pending', progress: 0 },
      { id: '3', name: 'Creating chapter content', status: 'pending', progress: 0 },
      { id: '4', name: 'Generating book covers', status: 'pending', progress: 0 },
      { id: '5', name: 'Finalizing and optimizing', status: 'pending', progress: 0 }
    ];
    
    setGenerationSteps(steps);

    // Process each book in the CSV
    for (let bookIndex = 0; bookIndex < csvData.length; bookIndex++) {
      const bookData = csvData[bookIndex];
      setCurrentBookIndex(bookIndex);

      // Simulate the generation process for each book
      for (let i = 0; i < steps.length; i++) {
        // Update step to running
        setGenerationSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'running', progress: 0 } : step
        ));

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setGenerationSteps(prev => prev.map((step, index) => 
            index === i ? { ...step, progress } : step
          ));
        }

        // Complete step
        setGenerationSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'completed', progress: 100 } : step
        ));

        // Start next step if not the last one
        if (i < steps.length - 1) {
          setGenerationSteps(prev => prev.map((step, index) => 
            index === i + 1 ? { ...step, status: 'running', progress: 0 } : step
          ));
        }
      }

                     // Generate comprehensive mock book data
        const generateComprehensiveContent = (title: string, niche: string, targetAudience: string, wordCount: number) => {
          const chapters = Math.max(3, Math.floor(wordCount / 2000));
          const wordsPerChapter = Math.floor(wordCount / chapters);
          
          let content = `${title.toUpperCase()}\nA Comprehensive Guide for ${targetAudience}\n\n`;
          content += `Table of Contents\n`;
          for (let i = 1; i <= chapters; i++) {
            content += `${i}. Chapter ${i}\n`;
          }
          content += `\n`;

          for (let i = 1; i <= chapters; i++) {
            content += `CHAPTER ${i}: ${getChapterTitle(i, niche, targetAudience)}\n\n`;
            content += `${getChapterContent(i, niche, targetAudience, wordsPerChapter)}\n\n`;
          }

          content += `CONCLUSION\n\n`;
          content += `In conclusion, this comprehensive guide has provided you with essential knowledge and practical strategies for success in ${niche.toLowerCase()}. Whether you're a ${targetAudience.toLowerCase()} or an experienced professional, the insights shared in this book will help you achieve your goals and overcome challenges.\n\n`;
          content += `Remember that success is a journey, not a destination. Apply the principles and strategies outlined in this guide consistently, and you'll see remarkable improvements in your ${niche.toLowerCase()} endeavors.\n\n`;
          content += `Thank you for choosing this guide as your companion on this journey. Your dedication to learning and growth will undoubtedly lead to outstanding results.\n\n`;
          content += `Best wishes for your continued success!\n\n`;
          content += `---\n`;
          content += `Generated with AI assistance for educational purposes.\n`;
          content += `Word count: ${wordCount.toLocaleString()} words\n`;
          content += `Target audience: ${targetAudience}\n`;
          content += `Niche: ${niche}\n`;

          return content;
        };

        const getChapterTitle = (chapterNum: number, niche: string, targetAudience: string): string => {
          const titles = {
            1: `Introduction to ${niche}`,
            2: `Understanding the Fundamentals`,
            3: `Advanced Strategies and Techniques`,
            4: `Practical Applications`,
            5: `Overcoming Common Challenges`,
            6: `Best Practices and Optimization`,
            7: `Scaling and Growth`,
            8: `Future Trends and Opportunities`,
            9: `Case Studies and Success Stories`,
            10: `Implementation and Action Plan`
          };
          return titles[chapterNum as keyof typeof titles] || `Chapter ${chapterNum}`;
        };

        const getChapterContent = (chapterNum: number, niche: string, targetAudience: string, wordCount: number): string => {
          const baseContent = `This chapter provides comprehensive insights into ${niche.toLowerCase()} specifically tailored for ${targetAudience.toLowerCase()}. We'll explore essential concepts, practical strategies, and actionable tips that will help you succeed in this field.\n\n`;
          
          const detailedContent = `Understanding the fundamentals is crucial for success in any ${niche.toLowerCase()} endeavor. This chapter breaks down complex concepts into digestible, actionable information that you can immediately apply to your projects and goals.\n\n`;
          
          const practicalContent = `Real-world application is where theory meets practice. In this chapter, we'll examine case studies, analyze successful strategies, and provide step-by-step guidance for implementing what you've learned.\n\n`;
          
          const advancedContent = `Once you've mastered the basics, it's time to explore advanced techniques and strategies. This chapter delves into sophisticated approaches that can give you a competitive edge in the ${niche.toLowerCase()} landscape.\n\n`;
          
          const optimizationContent = `Optimization is the key to maximizing your results. This chapter focuses on fine-tuning your approach, identifying opportunities for improvement, and implementing best practices that drive success.\n\n`;

          const contents = [
            baseContent,
            detailedContent,
            practicalContent,
            advancedContent,
            optimizationContent
          ];

          const selectedContent = contents[(chapterNum - 1) % contents.length];
          const expandedContent = selectedContent.repeat(Math.ceil(wordCount / selectedContent.length));
          
          return expandedContent.substring(0, wordCount);
        };

        const mockBook: GeneratedBook = {
          id: `${Date.now()}-${bookIndex}`,
          title: bookData.title,
          content: generateComprehensiveContent(bookData.title, bookData.niche, bookData.targetAudience, parseInt(bookData.wordCount)),
         coverUrl: `https://via.placeholder.com/400x600/3B82F6/FFFFFF?text=${encodeURIComponent(bookData.title)}`,
         niche: bookData.niche,
         targetAudience: bookData.targetAudience,
         wordCount: parseInt(bookData.wordCount),
         createdAt: new Date().toISOString(),
         status: 'generated' as const
       };

      setGeneratedBooks(prev => [...prev, mockBook]);
    }

    setIsGenerating(false);
  };

  const handleSaveAll = () => {
    if (generatedBooks.length > 0) {
      // Save to local storage or send to backend
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
      
      // Add books with 'saved' status for My Books page
      const booksToSave = generatedBooks.map(book => ({
        ...book,
        status: 'saved' as const,
        savedAt: new Date().toISOString()
      }));
      
      savedBooks.push(...booksToSave);
      localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
      alert(`${generatedBooks.length} books saved successfully! You can view them in the "My Books" page.`);
    }
  };

  const handleDownloadAll = () => {
    if (generatedBooks.length > 0) {
      // Create and download all books as a zip or individual files
      generatedBooks.forEach((book, index) => {
        const blob = new Blob([book.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  };

    const downloadCSVTemplate = () => {
    const template = `title,prompt,niche,targetaudience,wordcount,keywords,description
 "Sample Book Title","Write a book about healthy eating habits","Health & Fitness","Beginners","5000","nutrition,health,wellness","A comprehensive guide to healthy eating"
 "Business Success Guide","Create a book about starting a business","Business & Entrepreneurship","Entrepreneurs","10000","business,startup,entrepreneurship","Complete guide to business success"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'book_creation_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewSampleBook = () => {
    setSelectedBook(sampleBooks[0]);
    setShowBookView(true);
  };

  const handleDownloadSample = () => {
    const sampleContent = `THE COMPLETE GUIDE TO HEALTHY EATING
A Comprehensive Approach to Nutrition and Wellness

Table of Contents
1. Introduction to Healthy Eating
2. Understanding Macronutrients
3. The Power of Micronutrients
4. Building Your Perfect Plate
5. Meal Planning Strategies
6. Smart Shopping and Food Preparation
7. Eating for Different Life Stages
8. Overcoming Common Challenges
9. Sustainable Healthy Habits
10. Recipes and Meal Ideas

CHAPTER 1: INTRODUCTION TO HEALTHY EATING

Welcome to your transformative journey toward optimal health and wellness. This comprehensive guide is designed to demystify nutrition and provide you with practical, evidence-based strategies for making sustainable changes to your eating habits.

In today's information-saturated world, navigating the complex landscape of nutrition advice can feel overwhelming. Fad diets, conflicting research, and marketing messages often create confusion rather than clarity. This guide cuts through the noise to deliver clear, actionable information that you can trust.

What You'll Learn
• The fundamental principles of balanced nutrition
• How to read and understand food labels
• Strategies for meal planning and preparation
• Tips for eating well on a budget
• How to maintain healthy habits in social situations
• Recipes and meal ideas for every occasion

The Science Behind Healthy Eating
Research consistently shows that a balanced diet rich in whole foods is associated with:
• Reduced risk of chronic diseases
• Improved energy levels and mental clarity
• Better weight management
• Enhanced immune function
• Increased longevity and quality of life

CHAPTER 2: UNDERSTANDING MACRONUTRIENTS

Macronutrients are the three main categories of nutrients that provide energy: proteins, carbohydrates, and fats. Understanding how these work together is essential for creating a balanced diet.

Proteins: The Building Blocks of Life
Proteins are essential for:
• Building and repairing muscle tissue
• Supporting immune function
• Creating enzymes and hormones
• Maintaining healthy skin, hair, and nails

High-quality protein sources include:
• Lean meats (chicken, turkey, lean beef)
• Fish and seafood
• Eggs and dairy products
• Legumes (beans, lentils, chickpeas)
• Nuts and seeds
• Plant-based protein powders

Recommended daily intake: 0.8-1.2 grams per kilogram of body weight

Carbohydrates: Your Body's Preferred Energy Source
Carbohydrates are your body's primary fuel source, especially for your brain and muscles. However, not all carbohydrates are created equal.

Complex Carbohydrates (Choose These):
• Whole grains (brown rice, quinoa, oats)
• Fruits and vegetables
• Legumes
• Sweet potatoes and other starchy vegetables

Simple Carbohydrates (Limit These):
• Refined sugars
• White bread and pasta
• Sugary beverages
• Processed snacks

Fats: Essential for Health
Fats are crucial for:
• Brain health and cognitive function
• Hormone production
• Absorption of fat-soluble vitamins
• Cell membrane structure
• Energy storage

Healthy Fat Sources:
• Avocados and avocado oil
• Nuts and seeds
• Olive oil and olives
• Fatty fish (salmon, mackerel, sardines)
• Coconut oil (in moderation)

CHAPTER 3: THE POWER OF MICRONUTRIENTS

Micronutrients—vitamins and minerals—are essential for countless bodily functions, even though we need them in smaller amounts than macronutrients.

Essential Vitamins
Vitamin A: Supports vision, immune function, and skin health
Vitamin C: Boosts immune system and aids in collagen production
Vitamin D: Essential for bone health and immune function
Vitamin E: Powerful antioxidant that protects cells
Vitamin K: Important for blood clotting and bone health
B Vitamins: Support energy production and nervous system function

Key Minerals
Calcium: Essential for bone health and muscle function
Iron: Critical for oxygen transport in blood
Magnesium: Supports muscle and nerve function
Zinc: Important for immune function and wound healing
Potassium: Helps regulate blood pressure and fluid balance

CHAPTER 4: BUILDING YOUR PERFECT PLATE

The Plate Method is a simple, visual way to ensure balanced meals:

Half Your Plate: Vegetables and Fruits
• Aim for a rainbow of colors
• Include both raw and cooked vegetables
• Choose seasonal produce when possible
• Don't forget about frozen options

One-Quarter: Lean Protein
• Choose lean cuts of meat
• Include plant-based proteins
• Vary your protein sources
• Consider portion size (3-4 ounces per meal)

One-Quarter: Whole Grains
• Choose whole grain options
• Include a variety of grains
• Watch portion sizes
• Consider your activity level

Portion Control Strategies
• Use smaller plates and bowls
• Eat slowly and mindfully
• Listen to your hunger and fullness cues
• Avoid eating directly from packages
• Pre-portion snacks and meals

CHAPTER 5: MEAL PLANNING STRATEGIES

Effective meal planning can save time, money, and stress while ensuring you eat well throughout the week.

Weekly Planning Process
1. Check your schedule for the week
2. Plan meals based on your time availability
3. Create a shopping list
4. Prep ingredients in advance
5. Cook in batches when possible

Time-Saving Tips
• Prep vegetables on Sunday for the week
• Cook grains and proteins in large batches
• Use slow cookers and pressure cookers
• Keep healthy convenience foods on hand
• Plan for leftovers

Budget-Friendly Strategies
• Buy seasonal produce
• Purchase in bulk when possible
• Use frozen and canned options
• Plan meals around sales
• Reduce food waste

CHAPTER 6: SMART SHOPPING AND FOOD PREPARATION

Making healthy choices starts at the grocery store and continues in your kitchen.

Grocery Shopping Tips
• Never shop when hungry
• Stick to your shopping list
• Shop the perimeter of the store first
• Read food labels carefully
• Choose whole foods over processed options

Understanding Food Labels
• Check serving sizes
• Look for added sugars
• Avoid artificial ingredients
• Choose products with fewer ingredients
• Pay attention to sodium content

Food Preparation Techniques
• Learn basic cooking methods
• Invest in quality kitchen tools
• Practice food safety
• Experiment with herbs and spices
• Develop your cooking skills gradually

CHAPTER 7: EATING FOR DIFFERENT LIFE STAGES

Nutritional needs change throughout life, and understanding these changes helps you make appropriate choices.

Children and Adolescents
• Focus on establishing healthy habits
• Provide regular meals and snacks
• Include a variety of foods
• Be a positive role model
• Avoid restrictive diets

Adults
• Maintain balanced nutrition
• Consider activity level and goals
• Address specific health concerns
• Focus on prevention
• Adapt to lifestyle changes

Older Adults
• Ensure adequate protein intake
• Focus on bone health
• Stay hydrated
• Consider digestive changes
• Address any medical conditions

CHAPTER 8: OVERCOMING COMMON CHALLENGES

Everyone faces obstacles when trying to eat healthily. Here are strategies for common challenges.

Time Constraints
• Plan and prep in advance
• Use time-saving cooking methods
• Keep healthy convenience foods
• Simplify meal planning
• Accept that perfect isn't necessary

Budget Limitations
• Plan meals around sales
• Buy in bulk when possible
• Use frozen and canned options
• Cook at home more often
• Reduce food waste

Social Situations
• Plan ahead for events
• Bring healthy dishes to share
• Practice portion control
• Focus on socializing, not just eating
• Don't deprive yourself completely

Emotional Eating
• Identify triggers
• Develop alternative coping strategies
• Practice mindful eating
• Seek support when needed
• Be kind to yourself

CHAPTER 9: SUSTAINABLE HEALTHY HABITS

Creating lasting change requires building sustainable habits that fit your lifestyle.

Habit Formation Strategies
• Start with small, manageable changes
• Be consistent rather than perfect
• Track your progress
• Celebrate small wins
• Adjust as needed

Mindful Eating Practices
• Eat without distractions
• Pay attention to hunger and fullness
• Savor your food
• Eat slowly
• Listen to your body

Long-term Success Factors
• Find what works for you
• Be flexible and adaptable
• Focus on progress, not perfection
• Build a support system
• Maintain realistic expectations

CHAPTER 10: RECIPES AND MEAL IDEAS

Here are some simple, nutritious recipes to get you started:

Breakfast Ideas
• Overnight oats with berries and nuts
• Greek yogurt parfait with granola
• Vegetable omelet with whole grain toast
• Smoothie bowl with fresh fruit
• Avocado toast with eggs

Lunch Options
• Quinoa salad with vegetables and protein
• Turkey and avocado wrap
• Lentil soup with whole grain bread
• Buddha bowl with grains and vegetables
• Tuna salad with mixed greens

Dinner Suggestions
• Grilled salmon with roasted vegetables
• Chicken stir-fry with brown rice
• Vegetarian chili with cornbread
• Lean beef tacos with whole grain tortillas
• Pasta with marinara and lean protein

Snack Ideas
• Apple slices with almond butter
• Greek yogurt with berries
• Hummus with carrot sticks
• Mixed nuts and dried fruit
• Hard-boiled eggs

CONCLUSION

Remember that healthy eating is a journey, not a destination. It's about making consistent, sustainable choices that support your health and well-being. Don't strive for perfection—aim for progress.

Key Takeaways:
• Focus on whole, minimally processed foods
• Include a variety of nutrients in your diet
• Plan and prepare meals in advance
• Practice mindful eating
• Be patient and kind to yourself

The path to better health through nutrition is unique for each person. Use this guide as a starting point, but always listen to your body and adjust your approach based on your individual needs, preferences, and circumstances.

Start with small changes, build on your successes, and remember that every healthy choice you make is a step toward a healthier, more vibrant life.

Remember: Small changes add up to big results over time. Your future self will thank you for the healthy choices you make today.`;
    
    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sample_Book_Healthy_Eating_Guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewGeneratedBook = (book: GeneratedBook) => {
    setSelectedBook(book);
    setShowBookView(true);
  };

  const handleDownloadGeneratedBook = (book: GeneratedBook) => {
    const blob = new Blob([book.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const closeBookView = () => {
    setShowBookView(false);
    setSelectedBook(null);
  };

  const handleViewDropdown = (book: GeneratedBook, event: React.MouseEvent) => {
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
  };

  const closeDropdown = () => {
    setShowDropdown(null);
    setSelectedBookForDropdown(null);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
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
  }, [showDropdown]);

  return (
    <BookCreationGuard>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Books from CSV</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to generate multiple books with AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Hot Selling Genres & Amazon KDP Suggestions */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Hot Selling Genres & Amazon KDP Suggestions
              </CardTitle>
              <CardDescription>
                Generate popular book types that are trending on Amazon KDP
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowApiBooks(!showApiBooks)}
              >
                {showApiBooks ? 'Hide' : 'Show'} API Books
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchBooks}
                disabled={isLoadingBooks}
              >
                {isLoadingBooks ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden group">
            {/* Live Moving Slider Container */}
            <div className="flex gap-3 cursor-grab active:cursor-grabbing animate-scroll">
              {(() => {
                // Combine API books with static suggestions
                const staticSuggestions = [
                  { title: "Weight Loss Guide", niche: "Health & Fitness", targetAudience: "Beginners", wordCount: 8000, prompt: "Create a comprehensive weight loss guide for beginners", description: "A complete guide to healthy weight loss with proven strategies and meal plans" },
                  { title: "Business Startup", niche: "Business & Entrepreneurship", targetAudience: "Entrepreneurs", wordCount: 10000, prompt: "Write a complete guide to starting a business from scratch", description: "Step-by-step guide to launching your own successful business venture" },
                  { title: "Digital Marketing", niche: "Marketing", targetAudience: "Professionals", wordCount: 12000, prompt: "Create a digital marketing strategy guide for businesses", description: "Comprehensive digital marketing strategies for modern businesses" },
                  { title: "Personal Finance", niche: "Finance", targetAudience: "Young Adults", wordCount: 9000, prompt: "Write a personal finance guide for young adults", description: "Essential money management skills for financial independence" },
                  { title: "Cooking Basics", niche: "Food & Cooking", targetAudience: "Beginners", wordCount: 7000, prompt: "Create a beginner's guide to cooking healthy meals", description: "Master the fundamentals of cooking with simple, delicious recipes" },
                  { title: "Productivity Hacks", niche: "Self-Improvement", targetAudience: "Professionals", wordCount: 6000, prompt: "Write a productivity guide with actionable hacks", description: "Transform your work efficiency with proven productivity techniques" },
                  { title: "Fitness Training", niche: "Health & Fitness", targetAudience: "Intermediate", wordCount: 8500, prompt: "Create a fitness training program for intermediate level", description: "Advanced workout routines to take your fitness to the next level" },
                  { title: "Social Media", niche: "Marketing", targetAudience: "Business Owners", wordCount: 9500, prompt: "Write a social media marketing guide for businesses", description: "Build your brand presence and engage customers effectively" }
                ];

                // Convert API books to suggestion format
                const apiSuggestions = apiBooks.map(book => ({
                  title: book.title,
                  niche: book.niche || 'General',
                  targetAudience: book.targetAudience || 'General Audience',
                  wordCount: book.wordCount || 5000,
                  prompt: `Create a book about ${book.title}`,
                  description: book.description || `A comprehensive guide about ${book.title}`,
                  isApiBook: true,
                  bookId: book.id
                }));

                // Combine suggestions (API books first if showing, then static)
                const allSuggestions = showApiBooks ? [...apiSuggestions, ...staticSuggestions] : staticSuggestions;

                return [
                  // Original cards
                  ...allSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex-shrink-0 w-44 h-68 border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-300 group">
                      {/* Card Header */}
                      <div className="h-16 mb-3">
                        <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">{suggestion.title}</h4>
                        {suggestion.isApiBook && (
                          <Badge variant="secondary" className="text-xs mt-1 bg-green-100 text-green-700">
                            From API
                          </Badge>
                        )}
                      </div>

                      {/* Badges Section - Fixed Height */}
                      <div className="h-20 mb-4 space-y-2">
                        <Badge variant="outline" className="text-xs w-full justify-center bg-gray-50">{suggestion.niche}</Badge>
                        <Badge variant="secondary" className="text-xs w-full justify-center">{suggestion.targetAudience}</Badge>
                        <Badge variant="outline" className="text-xs w-full justify-center bg-blue-50 text-blue-700 border-blue-200">{suggestion.wordCount.toLocaleString()} words</Badge>
                      </div>

                      {/* Description - Fixed Height */}
                      <div className="h-16 mb-4">
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{suggestion.description}</p>
                      </div>

                      {/* Action Buttons - Fixed Height */}
                      <div className="h-20 space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            // Handle book generation based on type
                            if (suggestion.isApiBook) {
                              // For API books, you might want to handle differently
                              console.log('Generating from API book:', suggestion.bookId);
                              // You can implement specific logic for API books here
                            } else {
                              // For static suggestions, use existing logic
                              const newPrompt = {
                                id: Date.now().toString(),
                                prompt: suggestion.prompt,
                                niche: suggestion.niche,
                                targetAudience: suggestion.targetAudience,
                                wordCount: suggestion.wordCount,
                                keywords: '',
                                description: suggestion.description,
                                createdAt: new Date().toISOString()
                              };
                              // You can add generation logic here if needed
                              console.log('Generated prompt:', newPrompt);
                            }
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          Generate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                          onClick={() => {
                            // Handle preview
                            console.log('Preview suggestion:', suggestion);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  )),
                  // Duplicate cards for seamless infinite scroll
                  ...allSuggestions.map((suggestion, index) => (
                    <div key={`duplicate-${index}`} className="flex-shrink-0 w-44 h-68 border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-300 group">
                      {/* Card Header */}
                      <div className="h-16 mb-3">
                        <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">{suggestion.title}</h4>
                        {suggestion.isApiBook && (
                          <Badge variant="secondary" className="text-xs mt-1 bg-green-100 text-green-700">
                            From API
                          </Badge>
                        )}
                      </div>

                      {/* Badges Section - Fixed Height */}
                      <div className="h-20 mb-4 space-y-2">
                        <Badge variant="outline" className="text-xs w-full justify-center bg-gray-50">{suggestion.niche}</Badge>
                        <Badge variant="secondary" className="text-xs w-full justify-center">{suggestion.targetAudience}</Badge>
                        <Badge variant="outline" className="text-xs w-full justify-center bg-blue-50 text-blue-700 border-blue-200">{suggestion.wordCount.toLocaleString()} words</Badge>
                      </div>

                      {/* Description - Fixed Height */}
                      <div className="h-16 mb-4">
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{suggestion.description}</p>
                      </div>

                      {/* Action Buttons - Fixed Height */}
                      <div className="h-20 space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            // Handle book generation based on type
                            if (suggestion.isApiBook) {
                              // For API books, you might want to handle differently
                              console.log('Generating from API book:', suggestion.bookId);
                              // You can implement specific logic for API books here
                            } else {
                              // For static suggestions, use existing logic
                              const newPrompt = {
                                id: Date.now().toString(),
                                prompt: suggestion.prompt,
                                niche: suggestion.niche,
                                targetAudience: suggestion.targetAudience,
                                wordCount: suggestion.wordCount,
                                keywords: '',
                                description: suggestion.description,
                                createdAt: new Date().toISOString()
                              };
                              // You can add generation logic here if needed
                              console.log('Generated prompt:', newPrompt);
                            }
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          Generate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                          onClick={() => {
                            // Handle preview
                            console.log('Preview suggestion:', suggestion);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))
                ];
              })()}
            </div>

            {/* Gradient Overlays for Smooth Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white to-transparent pointer-events-none"></div>

            {/* Pause Indicator */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Hover to pause
            </div>
          </div>

          {/* Error Display */}
          {booksError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <X className="h-4 w-4" />
                <span className="font-medium">Error loading books:</span>
                <span>{booksError}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setBooksError('')}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingBooks && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading books from API...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* CSV Upload Section */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                CSV Upload
              </CardTitle>
              <CardDescription>
                Upload a CSV file with book data to generate multiple books
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-upload">CSV File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {csvFile ? csvFile.name : 'Drop your CSV file here or click to browse'}
                  </p>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </Button>
                </div>
                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-2">CSV Validation Error</p>
                    <div className="text-sm text-red-700 whitespace-pre-line">{uploadError}</div>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadCSVTemplate}
                        className="text-red-700 border-red-300 hover:bg-red-100"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                onClick={downloadCSVTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>

              {csvData.length > 0 && (
                <div className="space-y-2">
                  <Label>CSV Preview ({csvData.length} books)</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                    {csvData.slice(0, 5).map((book, index) => (
                      <div key={index} className="text-sm py-1 border-b last:border-b-0">
                        <strong>{book.title}</strong> - {book.niche}
                      </div>
                    ))}
                    {csvData.length > 5 && (
                      <div className="text-sm text-muted-foreground py-1">
                        ... and {csvData.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleGenerateAll} 
                disabled={isGenerating || csvData.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating {currentBookIndex + 1}/{csvData.length}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {csvData.length} Books
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Generation Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Processing book {currentBookIndex + 1} of {csvData.length}
                </div>
                {generationSteps.map((step) => (
                  <div key={step.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn(
                        step.status === 'completed' && 'text-green-600',
                        step.status === 'running' && 'text-blue-600',
                        step.status === 'error' && 'text-red-600'
                      )}>
                        {step.name}
                      </span>
                      <span className="text-muted-foreground">
                        {step.progress}%
                      </span>
                    </div>
                    <Progress value={step.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Output Section */}
        <div className="xl:col-span-3 space-y-6">
          {generatedBooks.length > 0 ? (
            <>
              {/* Generated Books Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Generated Books ({generatedBooks.length})
                      </CardTitle>
                      <CardDescription>
                        All books have been successfully generated!
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleSaveAll}>
                        <Save className="h-4 w-4 mr-2" />
                        Save All
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                                 <CardContent>
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                     {generatedBooks.map((book, index) => (
                                               <div key={book.id} className="border border-gray-200 rounded-xl p-5 space-y-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 relative bg-white">
                                                   <div className="flex items-start gap-4">
                            <div className="relative">
                              <img 
                                src={book.coverUrl} 
                                alt={book.title}
                                className="w-18 h-28 object-cover rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
                              />
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-base mb-1 line-clamp-2 text-gray-900">{book.title}</h4>
                              <p className="text-sm text-blue-600 font-medium mb-2">{book.niche}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">{book.targetAudience}</Badge>
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-medium">{book.wordCount.toLocaleString()} words</Badge>
                              </div>
                            </div>
                          </div>
                                                   <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Generated on {new Date(book.createdAt).toLocaleDateString()}</span>
                            </div>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-medium">
                              {book.status}
                            </Badge>
                          </div>
                                                                             <div className="flex items-center gap-3 pt-3">
                            <div className="relative dropdown-container flex-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                                onClick={(e) => handleViewDropdown(book, e)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              
                                                             {/* Professional Dropdown View */}
                               {showDropdown === book.id && selectedBookForDropdown && (
                                 <div 
                                   className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] min-w-[380px] backdrop-blur-sm"
                                   data-dropdown={book.id}
                                 >
                                   {/* Arrow indicator */}
                                   <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                                   
                                   <div className="p-5">
                                     {/* Header with close button */}
                                     <div className="flex items-start justify-between mb-4">
                                       <div className="flex items-start gap-3 flex-1">
                                         <div className="relative">
                                           <img 
                                             src={selectedBookForDropdown.coverUrl} 
                                             alt={selectedBookForDropdown.title}
                                             className="w-14 h-20 object-cover rounded-lg border shadow-md flex-shrink-0"
                                           />
                                           <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                             <div className="w-2 h-2 bg-white rounded-full"></div>
                                           </div>
                                         </div>
                                         <div className="flex-1 min-w-0">
                                           <h4 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900">{selectedBookForDropdown.title}</h4>
                                           <p className="text-xs text-blue-600 font-medium mb-1">{selectedBookForDropdown.niche}</p>
                                           <div className="flex items-center gap-1 mb-2">
                                             <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{selectedBookForDropdown.targetAudience}</Badge>
                                             <Badge variant="secondary" className="text-xs bg-gray-100">{selectedBookForDropdown.wordCount.toLocaleString()} words</Badge>
                                           </div>
                                         </div>
                                       </div>
                                       <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                         onClick={closeDropdown}
                                       >
                                         <X className="h-3 w-3" />
                                       </Button>
                                     </div>

                                     {/* Stats Grid */}
                                     <div className="grid grid-cols-3 gap-3 mb-4">
                                       <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                         <div className="text-lg font-bold text-blue-700">{Math.max(3, Math.floor(selectedBookForDropdown.wordCount / 2000))}</div>
                                         <div className="text-xs text-blue-600 font-medium">Chapters</div>
                                       </div>
                                       <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                         <div className="text-lg font-bold text-green-700">A+</div>
                                         <div className="text-xs text-green-600 font-medium">Quality</div>
                                       </div>
                                       <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                         <div className="text-lg font-bold text-purple-700">{selectedBookForDropdown.wordCount > 10000 ? 'Premium' : 'Standard'}</div>
                                         <div className="text-xs text-purple-600 font-medium">Tier</div>
                                       </div>
                                     </div>
                                      
                                     <Separator className="my-4" />
                                      
                                     {/* Content Preview */}
                                     <div className="mb-4">
                                       <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-800">
                                         <FileText className="h-4 w-4 text-blue-600" />
                                         Content Preview
                                       </h5>
                                       <div className="max-h-28 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 text-xs leading-relaxed">
                                         <div className="space-y-2">
                                           <p className="font-semibold text-gray-800">
                                             📚 Table of Contents
                                           </p>
                                           <p className="text-gray-700">
                                             This comprehensive guide provides essential knowledge and practical strategies for success in <span className="font-medium text-blue-600">{selectedBookForDropdown.niche.toLowerCase()}</span>. Tailored specifically for <span className="font-medium text-green-600">{selectedBookForDropdown.targetAudience.toLowerCase()}</span>, this book contains <span className="font-bold">{selectedBookForDropdown.wordCount.toLocaleString()} words</span> of high-quality, actionable content.
                                           </p>
                                           <div className="flex items-center gap-2 text-gray-600">
                                             <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                             <span className="text-xs">Professional writing style</span>
                                           </div>
                                           <div className="flex items-center gap-2 text-gray-600">
                                             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                             <span className="text-xs">SEO optimized content</span>
                                           </div>
                                           <div className="flex items-center gap-2 text-gray-600">
                                             <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                             <span className="text-xs">Engaging storytelling</span>
                                           </div>
                                         </div>
                                       </div>
                                     </div>
                                      
                                     {/* Action Buttons */}
                                     <div className="flex items-center gap-3">
                                       <Button 
                                         variant="default" 
                                         size="sm" 
                                         className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                         onClick={() => handleViewGeneratedBook(selectedBookForDropdown)}
                                       >
                                         <Eye className="h-3 w-3 mr-2" />
                                         Full View
                                       </Button>
                                       <Button 
                                         variant="outline" 
                                         size="sm" 
                                         className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                                         onClick={() => handleDownloadGeneratedBook(selectedBookForDropdown)}
                                       >
                                         <Download className="h-3 w-3 mr-2" />
                                         Download
                                       </Button>
                                     </div>
                                     
                                     {/* Footer */}
                                     <div className="mt-4 pt-3 border-t border-gray-100">
                                       <div className="flex items-center justify-between text-xs text-gray-500">
                                         <span>Generated on {new Date(selectedBookForDropdown.createdAt).toLocaleDateString()}</span>
                                         <span className="flex items-center gap-1">
                                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                           Ready to publish
                                         </span>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               )}
                            </div>
                                                         <Button 
                               variant="outline" 
                               size="sm" 
                               className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                               onClick={() => handleDownloadGeneratedBook(book)}
                             >
                               <Download className="h-4 w-4 mr-2" />
                               Download
                             </Button>
                          </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
              </Card>
            </>
                     ) : (
             /* Empty State - Formal View */
             <Card>
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <div>
                     <CardTitle className="flex items-center gap-2">
                       <BookOpen className="h-5 w-5" />
                       Book Generation Workspace
                     </CardTitle>
                     <CardDescription>
                       Upload a CSV file to start generating your books
                     </CardDescription>
                   </div>
                   <Badge variant="secondary" className="flex items-center gap-1">
                     <Sparkles className="h-3 w-3" />
                     Ready
                   </Badge>
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-12">
                   <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-6">
                     <FileSpreadsheet className="h-12 w-12 text-blue-600" />
                   </div>
                   
                   <h3 className="text-xl font-semibold text-gray-900 mb-3">
                     Ready to Generate Books
                   </h3>
                   
                   <p className="text-gray-600 mb-6 max-w-md mx-auto">
                     Upload your CSV file with book specifications to start generating high-quality, AI-powered books tailored to your niche and target audience.
                   </p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                     <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                       <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                         <Upload className="h-6 w-6 text-white" />
                       </div>
                       <h4 className="font-semibold text-green-800 mb-1">Upload CSV</h4>
                       <p className="text-sm text-green-700">Provide book specifications in CSV format</p>
                     </div>
                     
                     <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                       <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                         <Sparkles className="h-6 w-6 text-white" />
                       </div>
                       <h4 className="font-semibold text-blue-800 mb-1">AI Generation</h4>
                       <p className="text-sm text-blue-700">AI creates comprehensive book content</p>
                     </div>
                     
                     <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                       <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                         <Download className="h-6 w-6 text-white" />
                       </div>
                       <h4 className="font-semibold text-purple-800 mb-1">Download</h4>
                       <p className="text-sm text-purple-700">Get your professionally formatted books</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-center gap-4">
                     <Button 
                       variant="outline" 
                       onClick={downloadCSVTemplate}
                       className="border-blue-200 text-blue-700 hover:bg-blue-50"
                     >
                       <Download className="h-4 w-4 mr-2" />
                       Download Template
                     </Button>
                     
                     <div className="text-sm text-gray-500">
                       or drag & drop your CSV file above
                     </div>
                   </div>
                 </div>
                 
                 <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                   <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                     <Target className="h-4 w-4 text-blue-600" />
                     What You'll Get
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="text-gray-700">Professional book content with chapters</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="text-gray-700">SEO-optimized writing style</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="text-gray-700">Target audience-specific content</span>
                       </div>
                     </div>
                     <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="text-gray-700">Customizable word count</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="text-gray-700">Multiple format downloads</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <span className="text-gray-700">Batch processing capability</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}
                 </div>
       </div>

       {/* Book View Modal */}
       {showBookView && selectedBook && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
             <div className="flex items-center justify-between p-6 border-b">
               <div>
                 <h2 className="text-2xl font-bold">{selectedBook.title}</h2>
                 <p className="text-muted-foreground">
                   {selectedBook.niche} • {selectedBook.targetAudience} • {selectedBook.wordCount.toLocaleString()} words
                 </p>
               </div>
               <Button variant="outline" onClick={closeBookView}>
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
               <div className="prose max-w-none">
                 <div className="whitespace-pre-line text-sm leading-relaxed">
                   {selectedBook.content}
                 </div>
               </div>
             </div>
             
             <div className="flex items-center justify-between p-6 border-t bg-gray-50">
               <div className="text-sm text-muted-foreground">
                 Generated on {new Date(selectedBook.createdAt).toLocaleDateString()}
               </div>
               <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   onClick={() => handleDownloadGeneratedBook(selectedBook)}
                 >
                   <Download className="h-4 w-4 mr-2" />
                   Download Book
                 </Button>
                 <Button onClick={closeBookView}>
                   Close
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Checkout Modal */}
       <CheckoutModal
         isOpen={showUpgradeModal}
         onClose={() => setShowUpgradeModal(false)}
         onSuccess={() => {
           setShowUpgradeModal(false);
           toast.success('Subscription upgraded successfully! You can now create books.');
         }}
         requiredFeature="Book Creation"
         triggerSource="book_creation"
       />
     </div>
    </BookCreationGuard>
   );
 };
