import React from 'react';
import { X, Lightbulb, AlertCircle } from 'lucide-react';
import { Problem } from '../types';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
}

const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, problem }) => {
  if (!isOpen) return null;

  // Find the most recent successful attempt with notes, or any notes from the problem
  const findHintSource = () => {
    // First check if problem has notes
    if (problem.notes && problem.notes.trim()) {
      return { type: 'problem', notes: problem.notes };
    }
    
    // Then find the most recent successful attempt with notes
    const successfulAttemptWithNotes = problem.reviewHistory
      .slice()
      .reverse()
      .find(review => review.wasCorrect && review.notes && review.notes.trim());
    
    if (successfulAttemptWithNotes) {
      return { type: 'review', notes: successfulAttemptWithNotes.notes, date: successfulAttemptWithNotes.date };
    }
    
    return null;
  };
  
  const hintSource = findHintSource();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Hint</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{problem.title}</h3>
          
          {hintSource ? (
            <div className="space-y-4">
              {hintSource.type === 'problem' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Your Notes:</h4>
                  <p className="text-blue-800 whitespace-pre-wrap">{hintSource.notes}</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Last Successful Approach ({new Date(hintSource.date!).toLocaleDateString()}):
                  </h4>
                  <p className="text-green-800 whitespace-pre-wrap">{hintSource.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Hints Available</h4>
              <p className="text-gray-600">
                No hints or notes are available for this problem yet. 
                Add notes when you solve it to help yourself in future reviews!
              </p>
            </div>
          )}
        </div>
    .slice()
    .reverse()
    .find(review => review.wasCorrect && review.notes);

  const hasHint = problem.notes || lastSuccessfulAttempt?.notes;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Hint</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{problem.title}</h3>
          
          {hasHint ? (
            <div className="space-y-4">
              {problem.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Your Notes:</h4>
                  <p className="text-blue-800 whitespace-pre-wrap">{problem.notes}</p>
                </div>
              )}
              
              {lastSuccessfulAttempt?.notes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Last Successful Approach ({new Date(lastSuccessfulAttempt.date).toLocaleDateString()}):
                  </h4>
                  <p className="text-green-800 whitespace-pre-wrap">{lastSuccessfulAttempt.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Hints Available</h4>
              <p className="text-gray-600">
                No hints or notes are available for this problem yet. 
                Add notes when you solve it to help yourself in future reviews!
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HintModal;