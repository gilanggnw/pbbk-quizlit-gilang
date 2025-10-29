package models

import "time"

type Quiz struct {
	ID             string     `json:"id"`
	UserID         string     `json:"user_id,omitempty"`
	Title          string     `json:"title"`
	Description    string     `json:"description"`
	Questions      []Question `json:"questions"`
	Difficulty     string     `json:"difficulty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
	TotalQuestions int        `json:"totalQuestions"`
}

type Question struct {
	ID            string                 `json:"id"`
	Type          string                 `json:"type"`
	Text          string                 `json:"text"`
	Question      string                 `json:"question"`
	Options       []string               `json:"options"`
	Correct       string                 `json:"correct"`
	CorrectAnswer int                    `json:"correctAnswer"`
	Points        int                    `json:"points"`
	Explanation   string                 `json:"explanation,omitempty"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

type CreateQuizRequest struct {
	Title         string `json:"title" binding:"required"`
	Description   string `json:"description" binding:"required"`
	Difficulty    string `json:"difficulty" binding:"required"`
	QuestionCount int    `json:"questionCount,omitempty"`
}

type FileUploadResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Content string `json:"content,omitempty"`
}

type GenerateQuizRequest struct {
	Content       string `json:"content" binding:"required"`
	Title         string `json:"title" binding:"required"`
	Description   string `json:"description" binding:"required"`
	Difficulty    string `json:"difficulty" binding:"required"`
	QuestionCount int    `json:"questionCount,omitempty"`
}

type QuizGenerationRequest struct {
	Title         string `json:"title" binding:"required"`
	Description   string `json:"description" binding:"required"`
	Difficulty    string `json:"difficulty" binding:"required"`
	QuestionCount int    `json:"questionCount,omitempty"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
