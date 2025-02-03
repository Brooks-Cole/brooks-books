# Brooks'Books

A web-based platform designed to foster community engagement through reading by creating digital connections between physical books and readers. The platform encourages young readers through artistic expression, vocabulary building, and community interaction.

## Features

- **Book Management**: Browse, search, and organize books
- **Drawing Submissions**: Share artistic interpretations of books
- **Vocabulary Tools**: 
  - Etymology exploration
  - Multi-language translations
  - Interactive vocabulary learning
- **Community Features**:
  - Discussion boards
  - Drawing sharing
  - Points and achievements system
- **Little Free Library Integration**: Digital interface for physical book locations

## Tech Stack

- **Frontend**: React.js with Material-UI and Tailwind CSS
- **Backend**: Node.js/Express
- **Databases**: 
  - MongoDB (primary data)
  - Neo4j (book relationships/recommendations)
- **Cloud Storage**: AWS S3 for user-generated content
- **APIs**: 
  - Google Cloud Translation
  - Tenor GIF API

## Development

### Prerequisites

- Node.js
- npm or yarn
- MongoDB
- Neo4j
- AWS S3 account

### Installation

1. Clone the repository
git clone https://github.com/Brooks-Cole/brooks-books.git

3. Install dependencies
# Frontend
cd frontend
npm install
# Backend
cd ../backend
npm install
cd brooks-books

3. Set up environment variables
Create .env files in both frontend and backend directories
Add necessary environment variables

4. Start the development servers
# Backend
cd backend
npm start
# Frontend
cd frontend
npm start


___________________
**Project Structure: **

'''Bash
.
├── .gitignore
├── .vscode
│   └── settings.json
├── backend
│   ├── .env.development
│   ├── .env.production
│   ├── .gitignore
│   ├── .node-version
│   ├── config
│   │   └── database.js
│   ├── folder_structure.txt
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── config
│       │   ├── config.js
│       │   ├── cors.js
│       │   ├── neo4j.js
│       │   └── s3.js
│       ├── controllers
│       │   └── graphController.js
│       ├── data
│       │   └── bookSeries.js
│       ├── middleware
│       │   ├── adminAuth.js
│       │   ├── auth.js
│       │   ├── csrf.js
│       │   ├── graphAuth.js
│       │   ├── graphError.js
│       │   ├── points.js
│       │   ├── rateLimit.js
│       │   └── upload.js
│       ├── models
│       │   ├── Book.js
│       │   ├── ChatMessage.js
│       │   ├── Discussion.js
│       │   ├── Series.js
│       │   ├── User.js
│       │   ├── UserProgress.js
│       │   ├── Vocabulary.js
│       │   ├── iResult.js
│       │   └── iScenario.js
│       ├── routes
│       │   ├── admin.js
│       │   ├── auth.js
│       │   ├── bookRoutes.js
│       │   ├── books.js
│       │   ├── discussions.js
│       │   ├── gifs.js
│       │   ├── graphRoutes.js
│       │   ├── iscenario.js
│       │   ├── maintenance.js
│       │   ├── quiz.js
│       │   ├── recommendations.js
│       │   ├── series.js
│       │   ├── translation.js
│       │   ├── users.js
│       │   └── vocabulary.js
│       ├── scripts
│       │   ├── initSeries.js
│       │   └── iseedScenario.js
│       ├── server.js
│       ├── services
│       │   ├── autoTaggingService.js
│       │   ├── cache.js
│       │   ├── googleBookService.js
│       │   ├── graphService.js
│       │   ├── gutenbergService.js
│       │   ├── quizGenerator.js
│       │   ├── tenorService.js
│       │   ├── translation.js
│       │   └── webSocketService.js
│       └── utils
│           └── graphSync.js
├── frontend
│   ├── .env.development
│   ├── .env.production
│   ├── .gitignore
│   ├── README.md
│   ├── README.me
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public
│   │   ├── book-placeholder.png
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── ServiceWorker.js
│   │   ├── assets
│   │   │   └── treehouse-library.jpg
│   │   ├── components
│   │   │   ├── BrowserCheck.js
│   │   │   ├── BulkUpload.js
│   │   │   ├── DiscoveryPanel.js
│   │   │   ├── DrawingCard.js
│   │   │   ├── EnhancedBookGraph.js
│   │   │   ├── EtymologyTree.jsx
│   │   │   ├── FilterBar.js
│   │   │   ├── FilterControls.js
│   │   │   ├── GifPicker.js
│   │   │   ├── Navbar.js
│   │   │   ├── OptimizedImage.jsx
│   │   │   ├── Prizes
│   │   │   │   └── PrizesDisplay.js
│   │   │   ├── QRCode.js
│   │   │   ├── ThemeToggle.js
│   │   │   ├── TreeNavigation.js
│   │   │   ├── VocabularyManagement.jsx
│   │   │   ├── VocabularyUpload.js
│   │   │   ├── WordEtymology.js
│   │   │   ├── books
│   │   │   │   ├── BookCard.js
│   │   │   │   ├── DrawingList.js
│   │   │   │   ├── GutenbergImport.js
│   │   │   │   ├── GutenbergImportDialog.js
│   │   │   │   └── TagInput.js
│   │   │   ├── common
│   │   │   │   ├── ErrorBoundary.js
│   │   │   │   └── LoadingSpinner.js
│   │   │   ├── debug-quiz.jsx
│   │   │   ├── series
│   │   │   │   ├── BookSelectionDialog.js
│   │   │   │   ├── SeriesBookForm.js
│   │   │   │   └── SeriesFormDialog.js
│   │   │   ├── stocks
│   │   │   │   └── iMarketSimulator.js
│   │   │   ├── ui
│   │   │   │   ├── alert.jsx
│   │   │   │   ├── button.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   └── textarea.jsx
│   │   │   └── vocabulary
│   │   │       ├── Etymology.jsx
│   │   │       ├── TranslationPanel.jsx
│   │   │       ├── VocabularyInterface.jsx
│   │   │       └── VocabularyQuiz.jsx
│   │   ├── config
│   │   │   ├── api.js
│   │   │   └── config.js
│   │   ├── constants
│   │   │   └── bookConstants.js
│   │   ├── context
│   │   │   └── AuthContext.js
│   │   ├── data
│   │   │   ├── PrizeUploader.js
│   │   │   └── bookSeries.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── lib
│   │   │   └── utils.js
│   │   ├── logo.svg
│   │   ├── pages
│   │   │   ├── About.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── BookDetail.js
│   │   │   ├── BookExplorer.js
│   │   │   ├── BookGallery.js
│   │   │   ├── Contact.js
│   │   │   ├── Discussions.js
│   │   │   ├── Home.js
│   │   │   ├── LittleLibrary.js
│   │   │   ├── Login.js
│   │   │   ├── Prizes.js
│   │   │   ├── QRCodeTracker.js
│   │   │   ├── QuizPage.js
│   │   │   ├── Register.js
│   │   │   ├── Resources.js
│   │   │   ├── SeriesManagement.js
│   │   │   ├── Treehouse.js
│   │   │   ├── UserProfile.js
│   │   │   ├── VocabularyPage.js
│   │   │   ├── Wokepedia.js
│   │   │   └── iMarketSimulator.js
│   │   ├── reportWebVitals.js
│   │   ├── services
│   │   │   ├── apiService.js
│   │   │   ├── etymologyAPI.js
│   │   │   ├── etymologyService.js
│   │   │   ├── localEtymologyData.js
│   │   │   ├── recommendationService.js
│   │   │   ├── seriesService.js
│   │   │   ├── translationService.js
│   │   │   ├── vocabularyService.js
│   │   │   └── webSocketService.js
│   │   ├── setupTests.js
│   │   └── utils
│   │       └── wordProcessing.js
│   └── tailwind.config.js
├── package-lock.json
├── package.json
└── temp.txt

34 directories, 165 files
'''

**Contributing**
Contributions are welcome! Please feel free to submit a Pull Request.

Please note that the Neo4j server will spin down after 48 hours of inactivity, please reach out if you need me to resume it.
