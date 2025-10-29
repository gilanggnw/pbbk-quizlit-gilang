package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
)

// CreateQuiz creates a new quiz with questions
func CreateQuiz(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by AuthMiddleware)
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}
	if len(req.Questions) == 0 {
		http.Error(w, "At least one question is required", http.StatusBadRequest)
		return
	}

	// Start transaction
	ctx := context.Background()
	tx, err := DB.Begin(ctx)
	if err != nil {
		log.Printf("Failed to begin transaction: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	// Insert quiz
	var quizID string
	err = tx.QueryRow(ctx,
		"INSERT INTO quizzes (user_id, title, pdf_filename) VALUES ($1, $2, $3) RETURNING id",
		userID, req.Title, req.PDFFilename,
	).Scan(&quizID)
	if err != nil {
		log.Printf("Failed to insert quiz: %v", err)
		http.Error(w, "Failed to create quiz", http.StatusInternalServerError)
		return
	}

	// Insert questions
	for _, q := range req.Questions {
		optionsJSON, err := json.Marshal(q.Options)
		if err != nil {
			log.Printf("Failed to marshal options: %v", err)
			http.Error(w, "Invalid options format", http.StatusBadRequest)
			return
		}

		_, err = tx.Exec(ctx,
			"INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES ($1, $2, $3, $4)",
			quizID, q.QuestionText, optionsJSON, q.CorrectAnswer,
		)
		if err != nil {
			log.Printf("Failed to insert question: %v", err)
			http.Error(w, "Failed to create quiz questions", http.StatusInternalServerError)
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		log.Printf("Failed to commit transaction: %v", err)
		http.Error(w, "Failed to create quiz", http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      quizID,
		"message": "Quiz created successfully",
	})
}

// ListQuizzes lists all available quizzes
func ListQuizzes(w http.ResponseWriter, r *http.Request) {
	// Get user from context (added by auth middleware)
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get query parameters
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 20
	offset := 0

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	ctx := context.Background()
	rows, err := DB.Query(ctx, `
		SELECT q.id, q.created_at, q.pdf_filename, q.user_id, q.title,
		       COUNT(qs.id) as question_count
		FROM quizzes q
		LEFT JOIN questions qs ON q.id = qs.quiz_id
		WHERE q.user_id = $1
		GROUP BY q.id, q.created_at, q.pdf_filename, q.user_id, q.title
		ORDER BY q.created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset) // Add userID as first parameter
	if err != nil {
		log.Printf("Failed to query quizzes: %v", err)
		http.Error(w, "Failed to fetch quizzes", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	quizzes := []QuizListItem{}
	for rows.Next() {
		var quiz QuizListItem
		err := rows.Scan(
			&quiz.ID,
			&quiz.CreatedAt,
			&quiz.PDFFilename,
			&quiz.UserID,
			&quiz.Title,
			&quiz.QuestionCount,
		)
		if err != nil {
			log.Printf("Failed to scan quiz: %v", err)
			continue
		}
		quizzes = append(quizzes, quiz)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"quizzes": quizzes,
		"limit":   limit,
		"offset":  offset,
	})
}

// GetQuizForTaking retrieves a quiz without revealing correct answers
func GetQuizForTaking(w http.ResponseWriter, r *http.Request) {
	// Extract quiz ID from URL path
	path := r.URL.Path
	id := strings.TrimPrefix(path, "/api/quiz/take/")
	if id == "" {
		http.Error(w, "Quiz ID is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get quiz details
	var quiz Quiz
	err := DB.QueryRow(ctx,
		"SELECT id, created_at, pdf_filename, user_id, title FROM quizzes WHERE id = $1",
		id,
	).Scan(&quiz.ID, &quiz.CreatedAt, &quiz.PDFFilename, &quiz.UserID, &quiz.Title)
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		log.Printf("Failed to query quiz: %v", err)
		http.Error(w, "Failed to fetch quiz", http.StatusInternalServerError)
		return
	}

	// Get questions (without correct answers)
	rows, err := DB.Query(ctx,
		"SELECT id, question_text, options FROM questions WHERE quiz_id = $1 ORDER BY id",
		id,
	)
	if err != nil {
		log.Printf("Failed to query questions: %v", err)
		http.Error(w, "Failed to fetch questions", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	questions := []QuestionForTaking{}
	for rows.Next() {
		var q QuestionForTaking
		var optionsJSON []byte
		err := rows.Scan(&q.ID, &q.QuestionText, &optionsJSON)
		if err != nil {
			log.Printf("Failed to scan question: %v", err)
			continue
		}

		// Parse options JSON
		if err := json.Unmarshal(optionsJSON, &q.Options); err != nil {
			log.Printf("Failed to unmarshal options: %v", err)
			continue
		}

		questions = append(questions, q)
	}

	// Build response
	response := QuizForTaking{
		ID:          quiz.ID,
		CreatedAt:   quiz.CreatedAt,
		PDFFilename: quiz.PDFFilename,
		UserID:      quiz.UserID,
		Title:       quiz.Title,
		Questions:   questions,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// SubmitQuizAttempt submits a quiz attempt and calculates the score
func SubmitQuizAttempt(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req SubmitQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get quiz questions with correct answers
	rows, err := DB.Query(ctx,
		"SELECT id, correct_answer FROM questions WHERE quiz_id = $1 ORDER BY id",
		req.QuizID,
	)
	if err != nil {
		log.Printf("Failed to query questions: %v", err)
		http.Error(w, "Failed to fetch quiz", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Build map of correct answers
	correctAnswers := make(map[string]string)
	totalQuestions := 0
	for rows.Next() {
		var questionID, correctAnswer string
		if err := rows.Scan(&questionID, &correctAnswer); err != nil {
			log.Printf("Failed to scan question: %v", err)
			continue
		}
		correctAnswers[questionID] = correctAnswer
		totalQuestions++
	}

	if totalQuestions == 0 {
		http.Error(w, "Quiz not found or has no questions", http.StatusNotFound)
		return
	}

	// Calculate score
	score := 0
	for questionID, userAnswer := range req.Answers {
		if correctAnswer, exists := correctAnswers[questionID]; exists {
			if userAnswer == correctAnswer {
				score++
			}
		}
	}

	// Convert answers map to JSON
	answersJSON, err := json.Marshal(req.Answers)
	if err != nil {
		log.Printf("Failed to marshal answers: %v", err)
		http.Error(w, "Invalid answers format", http.StatusBadRequest)
		return
	}

	// Insert quiz attempt WITH user_answers
	var attemptID string
	err = DB.QueryRow(ctx,
		"INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, user_answers, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id",
		req.QuizID, userID, score, totalQuestions, answersJSON,
	).Scan(&attemptID)
	if err != nil {
		log.Printf("Failed to insert quiz attempt: %v", err)
		http.Error(w, "Failed to submit quiz", http.StatusInternalServerError)
		return
	}

	// Return response
	percentage := float64(score) / float64(totalQuestions) * 100
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"attempt_id":      attemptID,
		"score":           score,
		"total_questions": totalQuestions,
		"percentage":      percentage,
	})
}

// GetQuizAttempt retrieves a specific quiz attempt with details
func GetQuizAttempt(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract attempt ID from URL path
	path := r.URL.Path
	id := strings.TrimPrefix(path, "/api/quiz/attempt/")
	if id == "" {
		http.Error(w, "Attempt ID is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Get attempt details
	var attempt QuizAttempt
	var answersJSON []byte
	err := DB.QueryRow(ctx, `
		SELECT qa.id, qa.created_at, qa.quiz_id, qa.user_id, qa.score, qa.total_questions, qa.user_answers,
		       q.title, q.pdf_filename
		FROM quiz_attempts qa
		JOIN quizzes q ON qa.quiz_id = q.id
		WHERE qa.id = $1 AND qa.user_id = $2
	`, id, userID).Scan(
		&attempt.ID,
		&attempt.CreatedAt,
		&attempt.QuizID,
		&attempt.UserID,
		&attempt.Score,
		&attempt.TotalQuestions,
		&answersJSON,
		&attempt.QuizTitle,
		&attempt.PDFFilename,
	)

	// Parse answers JSON
	if err := json.Unmarshal(answersJSON, &attempt.Answers); err != nil {
		log.Printf("Failed to unmarshal answers: %v", err)
		http.Error(w, "Invalid attempt data", http.StatusInternalServerError)
		return
	}

	// Get questions with correct answers
	rows, err := DB.Query(ctx,
		"SELECT id, question_text, options, correct_answer FROM questions WHERE quiz_id = $1 ORDER BY id",
		attempt.QuizID,
	)
	if err != nil {
		log.Printf("Failed to query questions: %v", err)
		http.Error(w, "Failed to fetch questions", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	questions := []Question{}
	for rows.Next() {
		var q Question
		var optionsJSON []byte
		err := rows.Scan(&q.ID, &q.QuestionText, &optionsJSON, &q.CorrectAnswer)
		if err != nil {
			log.Printf("Failed to scan question: %v", err)
			continue
		}

		// Parse options JSON
		if err := json.Unmarshal(optionsJSON, &q.Options); err != nil {
			log.Printf("Failed to unmarshal options: %v", err)
			continue
		}

		questions = append(questions, q)
	}

	attempt.Questions = questions
	attempt.Percentage = float64(attempt.Score) / float64(attempt.TotalQuestions) * 100

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(attempt)
}

// ListUserAttempts lists all attempts for the authenticated user
func ListUserAttempts(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := context.Background()
	rows, err := DB.Query(ctx, `
		SELECT qa.id, qa.created_at, qa.quiz_id, qa.score, qa.total_questions,
		       q.title, q.pdf_filename
		FROM quiz_attempts qa
		JOIN quizzes q ON qa.quiz_id = q.id
		WHERE qa.user_id = $1
		ORDER BY qa.created_at DESC
	`, userID)
	if err != nil {
		log.Printf("Failed to query attempts: %v", err)
		http.Error(w, "Failed to fetch attempts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	attempts := []AttemptListItem{}
	for rows.Next() {
		var attempt AttemptListItem
		err := rows.Scan(
			&attempt.ID,
			&attempt.CreatedAt,
			&attempt.QuizID,
			&attempt.Score,
			&attempt.TotalQuestions,
			&attempt.QuizTitle,
			&attempt.PDFFilename,
		)
		if err != nil {
			log.Printf("Failed to scan attempt: %v", err)
			continue
		}

		attempt.Percentage = float64(attempt.Score) / float64(attempt.TotalQuestions) * 100
		attempts = append(attempts, attempt)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"attempts": attempts,
	})
}
