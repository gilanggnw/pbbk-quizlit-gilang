package api

import (
	"pbkk-quizlit-backend/internal/config"
	"pbkk-quizlit-backend/internal/handlers"
	"pbkk-quizlit-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	config *config.Config
	router *gin.Engine
}

func NewServer(cfg *config.Config) *Server {
	// Set Gin mode
	if cfg.Port == "8080" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.CorsOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	server := &Server{
		config: cfg,
		router: router,
	}

	server.setupRoutes()
	return server
}

func (s *Server) setupRoutes() {
	// Initialize services
	fileService := services.NewFileService()
	aiService := services.NewAIService(s.config.OpenAIKey)
	quizService := services.NewQuizService()

	// Initialize handlers
	quizHandler := handlers.NewQuizHandler(quizService, aiService, fileService)

	// Health check
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"message": "QuizLit API is running",
		})
	})

	// API routes
	api := s.router.Group("/api/v1")
	{
		// Quiz routes
		quizzes := api.Group("/quizzes")
		{
			quizzes.POST("/upload", quizHandler.UploadFileAndGenerateQuiz)
			quizzes.POST("/generate", quizHandler.GenerateQuizFromText)
			quizzes.GET("/", quizHandler.GetAllQuizzes)
			quizzes.GET("/:id", quizHandler.GetQuiz)
			quizzes.PUT("/:id", quizHandler.UpdateQuiz)
			quizzes.DELETE("/:id", quizHandler.DeleteQuiz)
		}
	}
}

func (s *Server) Start() error {
	return s.router.Run(":" + s.config.Port)
}