import React from 'react';
import { useParams } from 'react-router-dom';
import VocabularyQuiz from '../components/vocabulary/VocabularyQuiz.jsx';

const QuizPage = () => {
  const { bookId } = useParams();
  
  console.log('QuizPage rendering with bookId:', bookId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vocabulary Quiz</h1>
      <VocabularyQuiz bookId={bookId} />
    </div>
  );
};

export default QuizPage; 