import React, { useEffect, useState } from 'react';
import { fetchCollections } from '../api/collection.api';
import { FolderOpen, MoreVertical, Layers } from 'lucide-react';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCollections = async () => {
      try {
        const res = await fetchCollections();
        setCollections(res.data.collections || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCollections();
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Your Collections</h1>
        <p className="text-gray-500 mt-1">Organized groups of your saved knowledge.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <div key={collection._id} className="group cursor-pointer">
            {/* Folder / Stack Preview Effect */}
            <div className="relative mb-4">
              {/* Decorative background cards to create a "stack" look */}
              <div className="absolute inset-0 bg-indigo-100 rounded-2xl transform translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-white border border-gray-200 rounded-2xl transform translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-300 shadow-sm"></div>
              
              {/* Main Preview Card */}
              <div className="relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-h-[160px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Layers size={20} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-1 mt-1">
                    {collection.description || "No description provided."}
                  </p>
                </div>

                {/* Tiny preview list of contents */}
                <div className="mt-4 space-y-1">
                  {collection.previewContents.slice(0, 2).map((content) => (
                    <div key={content._id} className="text-[11px] text-gray-400 flex items-center gap-2 truncate">
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                      {content.title}
                    </div>
                  ))}
                  {collection.previewContents.length > 2 && (
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                      +{collection.previewContents.length - 2} more items
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Collection Placeholder */}
        <button className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all min-h-[220px]">
          <div className="p-3 bg-gray-50 rounded-full mb-3 group-hover:bg-indigo-50">
            <FolderOpen size={24} />
          </div>
          <span className="font-medium">New Collection</span>
        </button>
      </div>
    </div>
  );
};

export default Collections;