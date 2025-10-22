package api

import (
	"log"
	"pbkk-quizlit-backend/internal/config"
	"pbkk-quizlit-backend/internal/database"
	"pbkk-quizlit-backend/internal/handlers"
	"pbkk-quizlit-backend/internal/middleware"
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

	// Initialize auth middleware with JWT secret
	if cfg.SupabaseJWTSecret != "" {
		middleware.InitAuth(cfg.SupabaseJWTSecret)
		log.Println("✅ Auth middleware initialized")
	} else {
		log.Println("⚠️  No SUPABASE_JWT_SECRET configured, auth will not work")
	}

	// Initialize database connection
	if cfg.DatabaseURL != "" {
		if err := database.Connect(cfg.DatabaseURL); err != nil {
			log.Printf("⚠️  Failed to connect to database: %v", err)
			log.Println("   Continuing without database (will use in-memory storage)")
		} else {
			log.Println("✅ Database connected successfully")
		}
	} else {
		log.Println("⚠️  No DATABASE_URL configured, using in-memory storage")
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
		// Quiz routes (protected)
		quizzes := api.Group("/quizzes")
		quizzes.Use(middleware.AuthMiddleware()) // Apply auth to all quiz routes
		{
			quizzes.POST("/upload", quizHandler.UploadFileAndGenerateQuiz)
			quizzes.POST("/generate", quizHandler.GenerateQuizFromText)
			quizzes.GET("/", quizHandler.GetAllQuizzes)
			quizzes.GET("/:id", quizHandler.GetQuiz)
			quizzes.PUT("/:id", quizHandler.UpdateQuiz)
			quizzes.DELETE("/:id", quizHandler.DeleteQuiz)

			// Quiz taking endpoints
			quizzes.GET("/take/:id", quizHandler.GetQuizForTaking)
			quizzes.POST("/submit", quizHandler.SubmitQuizAttempt)
			quizzes.GET("/attempt/:id", quizHandler.GetQuizAttempt)
			quizzes.GET("/attempts", quizHandler.ListUserAttempts)
		}
	}
}

func (s *Server) Start() error {
	return s.router.Run(":" + s.config.Port)
}
