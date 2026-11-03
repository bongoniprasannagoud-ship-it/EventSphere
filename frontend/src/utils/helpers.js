export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const isUpcoming = (date) => new Date(date) > new Date();

export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'Free';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const getCategoryColor = (category) => {
  const colors = {
    Tech: 'cat-Tech',
    Cultural: 'cat-Cultural',
    Sports: 'cat-Sports',
    Workshop: 'cat-Workshop',
  };
  return colors[category] || 'cat-Tech';
};

export const getCategoryIcon = (category) => {
  const icons = { Tech: '💻', Cultural: '🎭', Sports: '⚽', Workshop: '🔧' };
  return icons[category] || '📅';
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : '';
  return `${base}${path}`;
};
