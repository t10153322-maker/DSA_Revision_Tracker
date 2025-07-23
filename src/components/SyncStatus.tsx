import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, X } from 'lucide-react';

interface SyncStatusProps {
  loading: boolean;
  error: string | null;
  onSync: () => void;
  onClearError: () => void;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ loading, error, onSync, onClearError }) => {
  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Syncing...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm flex-1">{error}</span>
        <button
          onClick={onSync}
          className="text-yellow-600 hover:text-yellow-800 p-1 hover:bg-yellow-100 rounded transition-colors"
          title="Retry sync"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
        <button
          onClick={onClearError}
          className="text-yellow-600 hover:text-yellow-800 p-1 hover:bg-yellow-100 rounded transition-colors"
          title="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
      <Cloud className="h-4 w-4" />
      <span className="text-sm">Synced</span>
      <button
        onClick={onSync}
        className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded transition-colors"
        title="Force sync"
      >
        <RefreshCw className="h-3 w-3" />
      </button>
    </div>
  );
};

export default SyncStatus;