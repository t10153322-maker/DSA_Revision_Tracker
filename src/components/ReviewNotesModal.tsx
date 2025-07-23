import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface ReviewNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  initialNotes?: string;
}

const ReviewNotesModal: React.FC<ReviewNotesModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialNotes = '' 
}) => {
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Review Notes</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Add your approach, key insights, or things to remember for next time..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            These notes will be available as hints in future reviews.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewNotesModal;