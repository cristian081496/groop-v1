import React from 'react';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
  className?: string;
  text?: string;
  loadingText?: string;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  loading,
  hasMore,
  className = "btn-secondary px-4 py-2 rounded-md text-sm",
  text = "Load More",
  loadingText = "Loading..."
}) => {
  if (!hasMore) return null;
  
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={className}
    >
      {loading ? loadingText : text}
    </button>
  );
};

export default LoadMoreButton;
