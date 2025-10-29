package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"pbkk-quizlit-backend/internal/database"
	"pbkk-quizlit-backend/internal/models"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type QuizRepository struct{}

func NewQuizRepository() *QuizRepository {
	return &QuizRepository{}
}

// cleanQuestionText removes formatting artifacts and prefixes from question text
func cleanQuestionText(text string) string {
	// If text is empty, return as-is
	if text == "" {
		return text
	}

	// Remove bullet points and other special characters
	text = strings.ReplaceAll(text, "•", "")
	text = strings.ReplaceAll(text, "●", "")
	text = strings.ReplaceAll(text, "○", "")
	text = strings.ReplaceAll(text, "■", "")
	text = strings.ReplaceAll(text, "□", "")

	// Remove common question type prefixes followed by bullet/colon
	patterns := []string{
		`^Complete the sentence:\s*`,
		`^True or False:\s*`,
		`^Multiple Choice:\s*`,
		`^Fill in the blank:\s*`,
		`^Choose the correct answer:\s*`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		text = re.ReplaceAllString(text, "")
	}

	// Clean up extra whitespace
	text = strings.TrimSpace(text)
	re := regexp.MustCompile(`\s+`)
	text = re.ReplaceAllString(text, " ")

	// If cleaning resulted in empty string, return original
	if text == "" {
		return text
	}

	return text
}

// CreateQuiz creates a new quiz with questions in the database
func (r *QuizRepository) CreateQuiz(ctx context.Context, quiz *models.Quiz, userID string) error {
	db := database.GetDB()
	if db == nil {
		return fmt.Errorf("database connection not initialized")
	}

	// Start transaction
	tx, err := db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Insert quiz
	var quizID int64
	err = tx.QueryRow(ctx,
		`INSERT INTO quizzes (user_id, title, description, pdf_filename, created_at) 
		 VALUES ($1, $2, $3, $4, $5) 
		 RETURNING id`,
		userID, quiz.Title, quiz.Description, quiz.Title, time.Now(),
	).Scan(&quizID)
	if err != nil {
		return fmt.Errorf("failed to insert quiz: %w", err)
	}

	// Update quiz ID
	quiz.ID = fmt.Sprintf("%d", quizID)

	// Insert questions
	for i := range quiz.Questions {
		question := &quiz.Questions[i]

		// Clean the question text
		cleanedText := cleanQuestionText(question.Text)

		// Marshal options to JSON
		optionsJSON, err := json.Marshal(question.Options)
		if err != nil {
			return fmt.Errorf("failed to marshal options: %w", err)
		}

		// Get correct answer text
		correctAnswer := ""
		if question.CorrectAnswer >= 0 && question.CorrectAnswer < len(question.Options) {
			correctAnswer = question.Options[question.CorrectAnswer]
		}

		var questionID int64
		err = tx.QueryRow(ctx,
			`INSERT INTO questions (quiz_id, question_text, options, correct_answer) 
			 VALUES ($1, $2, $3::jsonb, $4) 
			 RETURNING id`,
			quizID, cleanedText, string(optionsJSON), correctAnswer,
		).Scan(&questionID)
		if err != nil {
			return fmt.Errorf("failed to insert question: %w", err)
		}

		question.ID = fmt.Sprintf("%d", questionID)
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetQuiz retrieves a quiz by ID
func (r *QuizRepository) GetQuiz(ctx context.Context, id string) (*models.Quiz, error) {
	db := database.GetDB()
	if db == nil {
		return nil, fmt.Errorf("database connection not initialized")
	}

	// Get quiz
	var quiz models.Quiz
	var title, description, pdfFilename, userID string
	var createdAt time.Time

	err := db.QueryRow(ctx,
		`SELECT id, user_id, title, description, pdf_filename, created_at FROM quizzes WHERE id = $1`,
		id,
	).Scan(&quiz.ID, &userID, &title, &description, &pdfFilename, &createdAt)
	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("quiz not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get quiz: %w", err)
	}

	quiz.UserID = userID

	quiz.Title = title
	quiz.Description = description
	quiz.CreatedAt = createdAt
	quiz.UpdatedAt = createdAt

	// Get questions
	rows, err := db.Query(ctx,
		`SELECT id, question_text, options, correct_answer 
		 FROM questions 
		 WHERE quiz_id = $1 
		 ORDER BY id`,
		id,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get questions: %w", err)
	}
	defer rows.Close()

	var questions []models.Question
	for rows.Next() {
		var q models.Question
		var optionsJSON []byte
		var correctAnswer string

		if err := rows.Scan(&q.ID, &q.Text, &optionsJSON, &correctAnswer); err != nil {
			return nil, fmt.Errorf("failed to scan question: %w", err)
		}

		// Unmarshal options
		if err := json.Unmarshal(optionsJSON, &q.Options); err != nil {
			return nil, fmt.Errorf("failed to unmarshal options: %w", err)
		}

		// Find correct answer index
		q.CorrectAnswer = -1
		for i, option := range q.Options {
			if option == correctAnswer {
				q.CorrectAnswer = i
				break
			}
		}

		q.Question = q.Text
		q.Type = "multiple-choice"
		q.Points = 1

		questions = append(questions, q)
	}

	quiz.Questions = questions
	quiz.TotalQuestions = len(questions)

	return &quiz, nil
}

// GetAllQuizzes retrieves all quizzes for a specific user
func (r *QuizRepository) GetAllQuizzes(ctx context.Context, userID string) ([]*models.Quiz, error) {
	db := database.GetDB()
	if db == nil {
		return nil, fmt.Errorf("database connection not initialized")
	}

	rows, err := db.Query(ctx,
		`SELECT q.id, q.title, q.description, q.pdf_filename, q.created_at, COUNT(qu.id) as question_count
		 FROM quizzes q
		 LEFT JOIN questions qu ON qu.quiz_id = q.id
		 WHERE q.user_id = $1
		 GROUP BY q.id, q.title, q.description, q.pdf_filename, q.created_at
		 ORDER BY q.created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query quizzes: %w", err)
	}
	defer rows.Close()

	var quizzes []*models.Quiz
	for rows.Next() {
		quiz := &models.Quiz{}
		var title, description, pdfFilename string
		var createdAt time.Time
		var questionCount int

		if err := rows.Scan(&quiz.ID, &title, &description, &pdfFilename, &createdAt, &questionCount); err != nil {
			return nil, fmt.Errorf("failed to scan quiz: %w", err)
		}

		quiz.Title = title
		quiz.Description = description
		quiz.CreatedAt = createdAt
		quiz.UpdatedAt = createdAt
		quiz.TotalQuestions = questionCount
		quiz.Difficulty = "medium" // Default

		quizzes = append(quizzes, quiz)
	}

	return quizzes, nil
}

// DeleteQuiz deletes a quiz and its questions
func (r *QuizRepository) DeleteQuiz(ctx context.Context, id string) error {
	db := database.GetDB()
	if db == nil {
		return fmt.Errorf("database connection not initialized")
	}

	// Start transaction
	tx, err := db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Delete questions first (foreign key constraint)
	_, err = tx.Exec(ctx, `DELETE FROM questions WHERE quiz_id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete questions: %w", err)
	}

	// Delete quiz
	result, err := tx.Exec(ctx, `DELETE FROM quizzes WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete quiz: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("quiz not found")
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// SaveQuizAttempt saves a quiz attempt to the database
func (r *QuizRepository) SaveQuizAttempt(ctx context.Context, quizID string, userID string, score int, totalQuestions int, answers map[string]string) (string, error) {
	db := database.GetDB()
	if db == nil {
		return "", fmt.Errorf("database connection not initialized")
	}

	// Convert quizID string to int64
	quizIDInt, err := strconv.ParseInt(quizID, 10, 64)
	if err != nil {
		return "", fmt.Errorf("invalid quiz ID format: %w", err)
	}

	// Marshal answers to JSON
	answersJSON, err := json.Marshal(answers)
	if err != nil {
		return "", fmt.Errorf("failed to marshal answers: %w", err)
	}

	var attemptID int64
	err = db.QueryRow(ctx,
		`INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, user_answers, created_at) 
		 VALUES ($1, $2, $3, $4, $5::jsonb, $6) 
		 RETURNING id`,
		quizIDInt, userID, score, totalQuestions, string(answersJSON), time.Now(),
	).Scan(&attemptID)
	if err != nil {
		return "", fmt.Errorf("failed to save quiz attempt: %w", err)
	}

	return fmt.Sprintf("%d", attemptID), nil
}

// GetQuizAttempt retrieves a quiz attempt by ID
func (r *QuizRepository) GetQuizAttempt(ctx context.Context, attemptID string) (map[string]interface{}, error) {
	db := database.GetDB()
	if db == nil {
		return nil, fmt.Errorf("database connection not initialized")
	}

	// Convert attemptID string to int64
	attemptIDInt, err := strconv.ParseInt(attemptID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid attempt ID format: %w", err)
	}

	// Get attempt details including user_answers
	var quizID int64
	var userID string
	var score int
	var totalQuestions int
	var createdAt time.Time
	var userAnswersJSON []byte

	err = db.QueryRow(ctx,
		`SELECT quiz_id, user_id, score, total_questions, user_answers, created_at 
		 FROM quiz_attempts 
		 WHERE id = $1`,
		attemptIDInt,
	).Scan(&quizID, &userID, &score, &totalQuestions, &userAnswersJSON, &createdAt)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("attempt not found")
		}
		return nil, fmt.Errorf("failed to get quiz attempt: %w", err)
	}

	// Get quiz details
	var title, description, pdfFilename string
	var quizCreatedAt time.Time
	err = db.QueryRow(ctx,
		`SELECT title, description, pdf_filename, created_at 
		 FROM quizzes 
		 WHERE id = $1`,
		quizID,
	).Scan(&title, &description, &pdfFilename, &quizCreatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to get quiz details: %w", err)
	}

	// Get all questions for this quiz
	rows, err := db.Query(ctx,
		`SELECT id, question_text, options, correct_answer 
		 FROM questions 
		 WHERE quiz_id = $1 
		 ORDER BY id`,
		quizID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get questions: %w", err)
	}
	defer rows.Close()

	questions := []map[string]interface{}{}
	for rows.Next() {
		var questionID int64
		var questionText string
		var optionsJSON []byte
		var correctAnswer string

		if err := rows.Scan(&questionID, &questionText, &optionsJSON, &correctAnswer); err != nil {
			return nil, fmt.Errorf("failed to scan question: %w", err)
		}

		var options []string
		if err := json.Unmarshal(optionsJSON, &options); err != nil {
			return nil, fmt.Errorf("failed to unmarshal options: %w", err)
		}

		questions = append(questions, map[string]interface{}{
			"id":             fmt.Sprintf("%d", questionID),
			"text":           questionText,
			"options":        options,
			"correct_answer": correctAnswer,
		})
	}

	// Parse user answers from JSON
	var userAnswers map[string]string
	if len(userAnswersJSON) > 0 {
		if err := json.Unmarshal(userAnswersJSON, &userAnswers); err != nil {
			return nil, fmt.Errorf("failed to unmarshal user answers: %w", err)
		}
	} else {
		userAnswers = make(map[string]string)
	}

	// Build the response
	result := map[string]interface{}{
		"attempt": map[string]interface{}{
			"id":              attemptID,
			"quiz_id":         fmt.Sprintf("%d", quizID),
			"user_id":         userID,
			"score":           score,
			"total_questions": totalQuestions,
			"answers":         userAnswers,
			"created_at":      createdAt.Format(time.RFC3339),
		},
		"quiz": map[string]interface{}{
			"id":          fmt.Sprintf("%d", quizID),
			"title":       title,
			"description": description,
			"created_at":  quizCreatedAt.Format(time.RFC3339),
			"questions":   questions,
		},
		"questions": questions,
	}

	return result, nil
}

// ListUserAttempts retrieves all quiz attempts for a specific user
func (r *QuizRepository) ListUserAttempts(ctx context.Context, userID string) ([]map[string]interface{}, error) {
	db := database.GetDB()
	if db == nil {
		return nil, fmt.Errorf("database connection not initialized")
	}

	rows, err := db.Query(ctx,
		`SELECT qa.id, qa.quiz_id, qa.score, qa.total_questions, qa.created_at, q.title, q.pdf_filename
		 FROM quiz_attempts qa
		 JOIN quizzes q ON qa.quiz_id = q.id
		 WHERE qa.user_id = $1
		 ORDER BY qa.created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query attempts: %w", err)
	}
	defer rows.Close()

	attempts := []map[string]interface{}{}
	for rows.Next() {
		var attemptID int64
		var quizID int64
		var score, totalQuestions int
		var createdAt time.Time
		var title, pdfFilename string

		if err := rows.Scan(&attemptID, &quizID, &score, &totalQuestions, &createdAt, &title, &pdfFilename); err != nil {
			return nil, fmt.Errorf("failed to scan attempt: %w", err)
		}

		percentage := float64(score) / float64(totalQuestions) * 100

		attempts = append(attempts, map[string]interface{}{
			"id":              fmt.Sprintf("%d", attemptID),
			"quiz_id":         fmt.Sprintf("%d", quizID),
			"quiz_title":      title,
			"score":           score,
			"total_questions": totalQuestions,
			"percentage":      percentage,
			"created_at":      createdAt.Format(time.RFC3339),
		})
	}

	return attempts, nil
}
