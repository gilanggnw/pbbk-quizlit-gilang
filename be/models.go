package main

import "time"

// Note: With Supabase Auth, user management is handled by Supabase
// We don't need custom User, RegisterRequest, or LoginRequest models
// User authentication is done through Supabase client SDK in the frontend

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

// Quiz represents a quiz in the database
type Quiz struct {
	ID          string    `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	PDFFilename *string   `json:"pdf_filename,omitempty"`
	UserID      string    `json:"user_id"`
	Title       string    `json:"title"`
}

// Question represents a quiz question
type Question struct {
	ID            string   `json:"id"`
	QuizID        string   `json:"quiz_id"`
	QuestionText  string   `json:"question_text"`
	Options       []string `json:"options"`
	CorrectAnswer string   `json:"correct_answer"`
}

// QuizAttempt represents a user's quiz attempt
type QuizAttempt struct {
	ID             string            `json:"id"`
	CreatedAt      time.Time         `json:"created_at"`
	QuizID         string            `json:"quiz_id"`
	UserID         string            `json:"user_id"`
	Score          int               `json:"score"`
	TotalQuestions int               `json:"total_questions"`
	Answers        map[string]string `json:"answers"`
	QuizTitle      *string           `json:"quiz_title,omitempty"`
	PDFFilename    *string           `json:"pdf_filename,omitempty"`
	Questions      []Question        `json:"questions,omitempty"`
	Percentage     float64           `json:"percentage"`
}

// CreateQuizRequest represents a request to create a quiz
type CreateQuizRequest struct {
	Title       string              `json:"title"`
	PDFFilename *string             `json:"pdf_filename,omitempty"`
	Questions   []QuestionCreateReq `json:"questions"`
}

// QuestionCreateReq represents a question in create quiz request
type QuestionCreateReq struct {
	QuestionText  string   `json:"question_text"`
	Options       []string `json:"options"`
	CorrectAnswer string   `json:"correct_answer"`
}

// SubmitQuizRequest represents a request to submit a quiz attempt
type SubmitQuizRequest struct {
	QuizID  string            `json:"quiz_id"`
	Answers map[string]string `json:"answers"` // map[questionID]userAnswer
}

// QuizListItem represents a quiz in list response
type QuizListItem struct {
	ID            string    `json:"id"`
	CreatedAt     time.Time `json:"created_at"`
	PDFFilename   *string   `json:"pdf_filename,omitempty"`
	UserID        string    `json:"user_id"`
	Title         string    `json:"title"`
	QuestionCount int       `json:"question_count"`
}

// QuestionForTaking represents a question without correct answer
type QuestionForTaking struct {
	ID           string   `json:"id"`
	QuestionText string   `json:"question_text"`
	Options      []string `json:"options"`
}

// QuizForTaking represents a quiz for taking (no correct answers)
type QuizForTaking struct {
	ID          string              `json:"id"`
	CreatedAt   time.Time           `json:"created_at"`
	PDFFilename *string             `json:"pdf_filename,omitempty"`
	UserID      string              `json:"user_id"`
	Title       string              `json:"title"`
	Questions   []QuestionForTaking `json:"questions"`
}

// AttemptListItem represents a quiz attempt in list response
type AttemptListItem struct {
	ID             string    `json:"id"`
	CreatedAt      time.Time `json:"created_at"`
	QuizID         string    `json:"quiz_id"`
	Score          int       `json:"score"`
	TotalQuestions int       `json:"total_questions"`
	Percentage     float64   `json:"percentage"`
	QuizTitle      *string   `json:"quiz_title,omitempty"`
	PDFFilename    *string   `json:"pdf_filename,omitempty"`
}
