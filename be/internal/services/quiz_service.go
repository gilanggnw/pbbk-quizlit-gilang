package services

import (
	"context"
	"fmt"
	"pbkk-quizlit-backend/internal/models"
	"pbkk-quizlit-backend/internal/repository"
	"time"

	"github.com/google/uuid"
)

type QuizService struct {
	repo *repository.QuizRepository
}

func NewQuizService() *QuizService {
	return &QuizService{
		repo: repository.NewQuizRepository(),
	}
}

func (qs *QuizService) CreateQuiz(quiz *models.Quiz, userID string) error {
	if quiz.ID == "" {
		quiz.ID = uuid.New().String()
	}

	quiz.CreatedAt = time.Now()
	quiz.UpdatedAt = time.Now()
	quiz.TotalQuestions = len(quiz.Questions)

	// Try to save to database
	ctx := context.Background()
	err := qs.repo.CreateQuiz(ctx, quiz, userID)
	if err != nil {
		return fmt.Errorf("failed to create quiz: %w", err)
	}

	return nil
}

func (qs *QuizService) GetQuiz(id string) (*models.Quiz, error) {
	ctx := context.Background()
	quiz, err := qs.repo.GetQuiz(ctx, id)
	if err != nil {
		return nil, err
	}
	return quiz, nil
}

func (qs *QuizService) GetAllQuizzes(userID string) ([]*models.Quiz, error) {
	ctx := context.Background()
	quizzes, err := qs.repo.GetAllQuizzes(ctx, userID)
	if err != nil {
		return nil, err
	}
	return quizzes, nil
}

func (qs *QuizService) UpdateQuiz(id string, updates *models.Quiz) error {
	// For now, updating is not implemented in DB layer
	// This would require more complex logic
	return fmt.Errorf("update not implemented yet")
}

func (qs *QuizService) DeleteQuiz(id string) error {
	ctx := context.Background()
	err := qs.repo.DeleteQuiz(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

func (qs *QuizService) GetQuizAttempt(attemptID string) (map[string]interface{}, error) {
	ctx := context.Background()
	attempt, err := qs.repo.GetQuizAttempt(ctx, attemptID)
	if err != nil {
		return nil, err
	}
	return attempt, nil
}

func (qs *QuizService) ListUserAttempts(userID string) ([]map[string]interface{}, error) {
	ctx := context.Background()
	attempts, err := qs.repo.ListUserAttempts(ctx, userID)
	if err != nil {
		return nil, err
	}
	return attempts, nil
}
