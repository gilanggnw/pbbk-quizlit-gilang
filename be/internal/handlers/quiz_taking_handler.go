package handlers

import (
	"fmt"
	"net/http"
	"pbkk-quizlit-backend/internal/middleware"
	"pbkk-quizlit-backend/internal/models"
	"pbkk-quizlit-backend/internal/repository"
	"time"

	"github.com/gin-gonic/gin"
)

// GetQuizForTaking returns a quiz without correct answers for taking
func (h *QuizHandler) GetQuizForTaking(c *gin.Context) {
	quizID := c.Param("id")
	if quizID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Quiz ID is required",
		})
		return
	}

	// Get the quiz
	quiz, err := h.quizService.GetQuiz(quizID)
	if err != nil {
		h.logger.Errorf("Failed to get quiz: %v", err)
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Quiz not found",
		})
		return
	}

	// Remove correct answers from questions
	for i := range quiz.Questions {
		quiz.Questions[i].CorrectAnswer = -1 // Hide correct answer
	}

	c.JSON(http.StatusOK, quiz)
}

// SubmitQuizAttempt handles quiz submission and scoring
func (h *QuizHandler) SubmitQuizAttempt(c *gin.Context) {
	var submission struct {
		QuizID  string            `json:"quiz_id"`
		Answers map[string]string `json:"answers"` // question_id -> answer (option text)
	}

	if err := c.ShouldBindJSON(&submission); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// Get the quiz with answers
	quiz, err := h.quizService.GetQuiz(submission.QuizID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Quiz not found",
		})
		return
	}

	// Calculate score
	correctCount := 0
	totalQuestions := len(quiz.Questions)
	results := make([]map[string]interface{}, 0)

	for _, question := range quiz.Questions {
		userAnswer := submission.Answers[question.ID]
		// Get the correct answer text from options
		correctAnswerText := ""
		if question.CorrectAnswer >= 0 && question.CorrectAnswer < len(question.Options) {
			correctAnswerText = question.Options[question.CorrectAnswer]
		}

		isCorrect := userAnswer == correctAnswerText

		if isCorrect {
			correctCount++
		}

		results = append(results, map[string]interface{}{
			"question_id":    question.ID,
			"question_text":  question.Text,
			"user_answer":    userAnswer,
			"correct_answer": correctAnswerText,
			"is_correct":     isCorrect,
		})
	}

	score := float64(correctCount) / float64(totalQuestions) * 100

	// Get user ID from context
	userID := middleware.GetUserID(c)

	// Save attempt to database with answers
	repo := repository.NewQuizRepository()
	ctx := c.Request.Context()
	attemptID, err := repo.SaveQuizAttempt(ctx, submission.QuizID, userID, correctCount, totalQuestions, submission.Answers)
	if err != nil {
		h.logger.Errorf("Failed to save quiz attempt: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to save quiz attempt: %v", err),
		})
		return
	}

	// Create attempt result
	result := map[string]interface{}{
		"attempt_id":      attemptID,
		"quiz_id":         submission.QuizID,
		"quiz_title":      quiz.Title,
		"total_questions": totalQuestions,
		"correct_answers": correctCount,
		"score":           score,
		"completed_at":    time.Now().Format(time.RFC3339),
		"results":         results,
	}

	c.JSON(http.StatusOK, result)
}

// GetQuizAttempt returns attempt results
func (h *QuizHandler) GetQuizAttempt(c *gin.Context) {
	attemptID := c.Param("id")
	if attemptID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Attempt ID is required",
		})
		return
	}

	// Get attempt from database
	result, err := h.quizService.GetQuizAttempt(attemptID)
	if err != nil {
		h.logger.Errorf("Failed to get quiz attempt: %v", err)
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Attempt not found",
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// ListUserAttempts lists all attempts for the current user
func (h *QuizHandler) ListUserAttempts(c *gin.Context) {
	// Get user ID from auth middleware
	userID := middleware.GetUserID(c)

	// Get attempts from database
	attempts, err := h.quizService.ListUserAttempts(userID)
	if err != nil {
		h.logger.Errorf("Failed to list user attempts: %v", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to retrieve attempts",
		})
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"attempts": attempts,
		"total":    len(attempts),
	})
}
