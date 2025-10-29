package handlers

import (
	"fmt"
	"net/http"
	"pbkk-quizlit-backend/internal/middleware"
	"pbkk-quizlit-backend/internal/models"
	"pbkk-quizlit-backend/internal/services"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type QuizHandler struct {
	quizService *services.QuizService
	aiService   *services.AIService
	fileService *services.FileService
	logger      *logrus.Logger
}

func NewQuizHandler(quizService *services.QuizService, aiService *services.AIService, fileService *services.FileService) *QuizHandler {
	return &QuizHandler{
		quizService: quizService,
		aiService:   aiService,
		fileService: fileService,
		logger:      logrus.New(),
	}
}

// UploadFileAndGenerateQuiz handles file upload and quiz generation
func (h *QuizHandler) UploadFileAndGenerateQuiz(c *gin.Context) {
	// Parse multipart form
	err := c.Request.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		h.logger.Errorf("Failed to parse multipart form: %v", err)
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Failed to parse form data",
		})
		return
	}

	// Get file from form
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		h.logger.Errorf("Failed to get file from form: %v", err)
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "No file uploaded",
		})
		return
	}

	// Get quiz details from form
	title := c.Request.FormValue("title")
	description := c.Request.FormValue("description")
	difficulty := c.Request.FormValue("difficulty")

	if title == "" || description == "" || difficulty == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Title, description, and difficulty are required",
		})
		return
	}

	// Process the uploaded file
	content, err := h.fileService.ProcessUploadedFile(file, header)
	if err != nil {
		h.logger.Errorf("Failed to process file: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to process uploaded file: " + err.Error(),
		})
		return
	}

	// Create quiz request
	quizReq := &models.QuizGenerationRequest{
		Title:         title,
		Description:   description,
		Difficulty:    difficulty,
		QuestionCount: 10, // Default
	}

	// Generate quiz using AI
	quiz, err := h.aiService.GenerateQuizFromContent(content, quizReq)
	if err != nil {
		h.logger.Errorf("Failed to generate quiz: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to generate quiz: " + err.Error(),
		})
		return
	}

	// Get user ID from context
	userID := middleware.GetUserID(c)

	// Save quiz
	err = h.quizService.CreateQuiz(quiz, userID)
	if err != nil {
		h.logger.Errorf("Failed to save quiz: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to save quiz",
		})
		return
	}

	h.logger.Infof("Successfully created quiz: %s", quiz.ID)
	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Quiz generated successfully",
		Data:    quiz,
	})
}

// GenerateQuizFromText handles quiz generation from text content
func (h *QuizHandler) GenerateQuizFromText(c *gin.Context) {
	var req models.GenerateQuizRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request format",
		})
		return
	}

	// Create quiz request
	quizReq := &models.QuizGenerationRequest{
		Title:         req.Title,
		Description:   req.Description,
		Difficulty:    req.Difficulty,
		QuestionCount: req.QuestionCount,
	}

	if quizReq.QuestionCount == 0 {
		quizReq.QuestionCount = 10
	}

	// Generate quiz using AI
	quiz, err := h.aiService.GenerateQuizFromContent(req.Content, quizReq)
	if err != nil {
		h.logger.Errorf("Failed to generate quiz with AI, using fallback: %v", err)
		// Use fallback quiz generation
		quiz = h.generateFallbackQuiz(req.Content, quizReq)
	}

	// Get user ID from context
	userID := middleware.GetUserID(c)

	// Save quiz
	err = h.quizService.CreateQuiz(quiz, userID)
	if err != nil {
		h.logger.Errorf("Failed to save quiz: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to save quiz",
		})
		return
	}

	h.logger.Infof("Successfully created quiz from text: %s", quiz.ID)
	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Quiz generated successfully",
		Data:    quiz,
	})
}

// GetQuiz returns a specific quiz
func (h *QuizHandler) GetQuiz(c *gin.Context) {
	id := c.Param("id")

	quiz, err := h.quizService.GetQuiz(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Quiz not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Quiz retrieved successfully",
		Data:    quiz,
	})
}

// GetAllQuizzes returns all quizzes for the authenticated user
func (h *QuizHandler) GetAllQuizzes(c *gin.Context) {
	// Get user ID from auth middleware
	userID := middleware.GetUserID(c)

	quizzes, err := h.quizService.GetAllQuizzes(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to retrieve quizzes",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Quizzes retrieved successfully",
		Data:    quizzes,
	})
}

// UpdateQuiz updates an existing quiz
func (h *QuizHandler) UpdateQuiz(c *gin.Context) {
	id := c.Param("id")

	var updates models.Quiz
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request format",
		})
		return
	}

	err := h.quizService.UpdateQuiz(id, &updates)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Quiz updated successfully",
	})
}

// DeleteQuiz deletes a quiz
func (h *QuizHandler) DeleteQuiz(c *gin.Context) {
	id := c.Param("id")

	// Get user ID from auth middleware
	userID := middleware.GetUserID(c)

	// Verify quiz ownership before deletion
	quiz, err := h.quizService.GetQuiz(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Quiz not found",
		})
		return
	}

	// Check if user owns this quiz
	if quiz.UserID != userID {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Message: "You don't have permission to delete this quiz",
		})
		return
	}

	err = h.quizService.DeleteQuiz(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	h.logger.Infof("Quiz %s deleted by user %s", id, userID)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Quiz deleted successfully",
	})
}

// generateFallbackQuiz creates a quiz when AI service fails
func (h *QuizHandler) generateFallbackQuiz(content string, req *models.QuizGenerationRequest) *models.Quiz {
	h.logger.Info("Generating fallback quiz")

	// Generate sample questions based on content
	questions := []models.Question{
		{
			ID:       "fallback-1",
			Question: fmt.Sprintf("Based on the uploaded content about '%s', which statement best describes the main topic?", h.extractMainTopic(content)),
			Options: []string{
				"The content covers the specified topic in detail",
				"The content is unrelated to the topic",
				"The content provides only basic information",
				"The content is outdated and irrelevant",
			},
			CorrectAnswer: 0,
			Explanation:   "This question is generated from your uploaded content analysis.",
		},
		{
			ID:       "fallback-2",
			Question: "What type of information would you expect to find in this material?",
			Options: []string{
				"Detailed explanations and examples",
				"Only theoretical concepts",
				"Historical background only",
				"No relevant information",
			},
			CorrectAnswer: 0,
			Explanation:   "Educational materials typically contain detailed explanations and practical examples.",
		},
		{
			ID:       "fallback-3",
			Question: fmt.Sprintf("If you were studying from this material (%s difficulty), what approach would be most effective?", req.Difficulty),
			Options: []string{
				"Read thoroughly and take notes",
				"Skim quickly for main points",
				"Memorize everything word-for-word",
				"Ignore the content completely",
			},
			CorrectAnswer: 0,
			Explanation:   "Active reading and note-taking are proven effective study strategies.",
		},
	}

	// Add more questions based on difficulty
	if req.Difficulty == "medium" || req.Difficulty == "hard" {
		questions = append(questions, models.Question{
			ID:       "fallback-4",
			Question: "What critical thinking skill is most important when analyzing this type of content?",
			Options: []string{
				"Evaluation and synthesis",
				"Simple memorization",
				"Speed reading only",
				"Passive consumption",
			},
			CorrectAnswer: 0,
			Explanation:   "Higher-level thinking requires evaluation and synthesis of information.",
		})
	}

	if req.Difficulty == "hard" {
		questions = append(questions, models.Question{
			ID:       "fallback-5",
			Question: "How would you apply the concepts from this material in a real-world scenario?",
			Options: []string{
				"Connect theory to practical applications",
				"Use only in academic settings",
				"Apply without understanding context",
				"Avoid practical application",
			},
			CorrectAnswer: 0,
			Explanation:   "Advanced learning involves connecting theoretical knowledge to real-world applications.",
		})
	}

	quiz := &models.Quiz{
		ID:             uuid.New().String(),
		Title:          req.Title + " (Demo Mode)",
		Description:    req.Description + " - Generated in demonstration mode without AI.",
		Questions:      questions,
		Difficulty:     req.Difficulty,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		TotalQuestions: len(questions),
	}

	return quiz
}

// extractMainTopic extracts a short topic description from content
func (h *QuizHandler) extractMainTopic(content string) string {
	// Simple topic extraction - take first meaningful words
	words := strings.Fields(content)
	if len(words) == 0 {
		return "the uploaded material"
	}

	// Take first few words as topic, max 6 words
	maxWords := 6
	if len(words) < maxWords {
		maxWords = len(words)
	}

	topic := strings.Join(words[:maxWords], " ")
	if len(topic) > 50 {
		topic = topic[:50] + "..."
	}

	return topic
}
