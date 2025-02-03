import React, { useState, useEffect } from 'react';
import { Gift, Filter } from 'lucide-react';

const PrizesDisplay = ({ userPoints = 0 }) => {
  const [prizes, setPrizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await fetch('/api/prizes');
        if (!response.ok) {
          throw new Error('Failed to fetch prizes');
        }
        const data = await response.json();
        setPrizes(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(prize => prize.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  const filteredPrizes = prizes.filter(prize => {
    const matchesCategory = selectedCategory === 'All' || prize.category === selectedCategory;
    const isAffordable = !showOnlyAffordable || prize.points <= userPoints;
    return matchesCategory && isAffordable;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with points display */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Prize Catalog</h1>
        <div className="bg-blue-100 p-4 rounded-lg">
          <span className="text-xl font-semibold">Your Points: {userPoints.toLocaleString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <select 
            className="border rounded-lg px-4 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyAffordable}
            onChange={(e) => setShowOnlyAffordable(e.target.checked)}
            className="rounded"
          />
          Show only items I can afford
        </label>
      </div>

      {/* Prizes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPrizes.map(prize => (
          <div 
            key={prize.id}
            className={`border rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105
              ${prize.points <= userPoints ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              {prize.imageUrl ? (
                <img 
                  src={prize.imageUrl} 
                  alt={prize.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Gift className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{prize.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{prize.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-600">
                  {prize.points.toLocaleString()} points
                </span>
                <a
                  href={prize.amazonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium
                    ${prize.points <= userPoints 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'}`}
                  onClick={(e) => {
                    if (prize.points > userPoints) {
                      e.preventDefault();
                    }
                  }}
                >
                  {prize.points <= userPoints ? 'Redeem' : 'Not Enough Points'}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrizes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No prizes found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrizesDisplay;