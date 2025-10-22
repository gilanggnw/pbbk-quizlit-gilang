package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"pbkk-quizlit-backend/internal/database"
	"pbkk-quizlit-backend/internal/models"
	"time"

	"github.com/jackc/pgx/v5"
)

type QuizRepository struct{}

func NewQuizRepository() *QuizRepository {
	return &QuizRepository{}
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
			 VALUES ($1, $2, $3, $4) 
			 RETURNING id`,
			quizID, question.Text, optionsJSON, correctAnswer,
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
	var title, description, pdfFilename string
	var createdAt time.Time

	err := db.QueryRow(ctx,
		`SELECT id, title, description, pdf_filename, created_at FROM quizzes WHERE id = $1`,
		id,
	).Scan(&quiz.ID, &title, &description, &pdfFilename, &createdAt)
	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("quiz not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get quiz: %w", err)
	}

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

// GetAllQuizzes retrieves all quizzes
func (r *QuizRepository) GetAllQuizzes(ctx context.Context) ([]*models.Quiz, error) {
	db := database.GetDB()
	if db == nil {
		return nil, fmt.Errorf("database connection not initialized")
	}

	rows, err := db.Query(ctx,
		`SELECT q.id, q.title, q.description, q.pdf_filename, q.created_at, COUNT(qu.id) as question_count
		 FROM quizzes q
		 LEFT JOIN questions qu ON qu.quiz_id = q.id
		 GROUP BY q.id, q.title, q.description, q.pdf_filename, q.created_at
		 ORDER BY q.created_at DESC`,
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
func (r *QuizRepository) SaveQuizAttempt(ctx context.Context, quizID string, userID string, score int, totalQuestions int) (string, error) {
	db := database.GetDB()
	if db == nil {
		return "", fmt.Errorf("database connection not initialized")
	}

	var attemptID int64
	err := db.QueryRow(ctx,
		`INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, created_at) 
		 VALUES ($1, $2, $3, $4, $5) 
		 RETURNING id`,
		quizID, userID, score, totalQuestions, time.Now(),
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

	// Get attempt details
	var quizID int64
	var userID string
	var score int
	var totalQuestions int
	var createdAt time.Time

	err := db.QueryRow(ctx,
		`SELECT quiz_id, user_id, score, total_questions, created_at 
		 FROM quiz_attempts 
		 WHERE id = $1`,
		attemptID,
	).Scan(&quizID, &userID, &score, &totalQuestions, &createdAt)

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

	// Build the response
	result := map[string]interface{}{
		"attempt": map[string]interface{}{
			"id":              attemptID,
			"quiz_id":         fmt.Sprintf("%d", quizID),
			"user_id":         userID,
			"score":           score,
			"total_questions": totalQuestions,
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
