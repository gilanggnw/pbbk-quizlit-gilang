package services

import (
	"fmt"
	"pbkk-quizlit-backend/internal/models"
	"sync"
	"time"

	"github.com/google/uuid"
)

type QuizService struct {
	quizzes    map[string]*models.Quiz
	mutex      sync.RWMutex
	storageFile string
}

func NewQuizService() *QuizService {
	qs := &QuizService{
		quizzes:     make(map[string]*models.Quiz),
		mutex:       sync.RWMutex{},
		storageFile: "quizzes.json",
	}
	
	// Load existing quizzes from file
	qs.loadQuizzes()
	return qs
}

func (qs *QuizService) CreateQuiz(quiz *models.Quiz) error {
	qs.mutex.Lock()
	defer qs.mutex.Unlock()

	if quiz.ID == "" {
		quiz.ID = uuid.New().String()
	}
	
	quiz.CreatedAt = time.Now()
	quiz.UpdatedAt = time.Now()
	quiz.TotalQuestions = len(quiz.Questions)

	qs.quizzes[quiz.ID] = quiz
	qs.saveQuizzes() // Save after creation
	return nil
}

func (qs *QuizService) GetQuiz(id string) (*models.Quiz, error) {
	qs.mutex.RLock()
	defer qs.mutex.RUnlock()

	quiz, exists := qs.quizzes[id]
	if !exists {
		return nil, fmt.Errorf("quiz not found")
	}

	return quiz, nil
}

func (qs *QuizService) GetAllQuizzes() ([]*models.Quiz, error) {
	qs.mutex.RLock()
	defer qs.mutex.RUnlock()

	var quizzes []*models.Quiz
	for _, quiz := range qs.quizzes {
		quizzes = append(quizzes, quiz)
	}

	return quizzes, nil
}

func (qs *QuizService) UpdateQuiz(id string, updates *models.Quiz) error {
	qs.mutex.Lock()
	defer qs.mutex.Unlock()

	quiz, exists := qs.quizzes[id]
	if !exists {
		return fmt.Errorf("quiz not found")
	}

	// Update fields
	if updates.Title != "" {
		quiz.Title = updates.Title
	}
	if updates.Description != "" {
		quiz.Description = updates.Description
	}
	if updates.Difficulty != "" {
		quiz.Difficulty = updates.Difficulty
	}
	if len(updates.Questions) > 0 {
		quiz.Questions = updates.Questions
		quiz.TotalQuestions = len(updates.Questions)
	}

	quiz.UpdatedAt = time.Now()
	qs.saveQuizzes() // Save after update
	return nil
}

func (qs *QuizService) DeleteQuiz(id string) error {
	qs.mutex.Lock()
	defer qs.mutex.Unlock()

	_, exists := qs.quizzes[id]
	if !exists {
		return fmt.Errorf("quiz not found")
	}

	delete(qs.quizzes, id)
	qs.saveQuizzes() // Save after deletion
	return nil
}

// loadQuizzes loads quizzes from the JSON file
func (qs *QuizService) loadQuizzes() {
	// For now, start with empty in-memory storage for demo
	return
}

// saveQuizzes saves current quizzes to the JSON file
func (qs *QuizService) saveQuizzes() {
	// For now, let's disable file saving to avoid crashes during demo
	// This will be a purely in-memory solution
	return
}