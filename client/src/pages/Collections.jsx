import React, { useEffect, useState } from 'react';
import { createCollection, fetchCollections, updateCollection } from '../api/collection.api';
import { FolderOpen, MoreVertical, Layers, X, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [openOptioNModal, setOpenOptionModal] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const navigate = useNavigate()

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

  const addCollection = async () => {
    if (!name.trim()) return;
    try {
      const res = await createCollection({ name, description });

      const data = res.data.collection || res.data

      const newCollection = {
        _id: data._id,
        name: data.name ?? name,
        description: data.description ?? description,
        previewContents: []
      }

      setCollections(prev => [...prev, newCollection])

      setName('');
      setDescription('');
      setCreateCollectionModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const updateCollectionDetails = async () => {
    try {
      const res = await updateCollection(selectedCollection._id, { name, description })
      setCollections(prev => prev.map(col => col._id === selectedCollection._id ? res.data.collection || res.data : col))
      setIsUpdateModalOpen(false)
      setSelectedCollection(null)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (selectedCollection) {
      setName(selectedCollection.name)
      setDescription(selectedCollection.description)
    }
  }, [selectedCollection])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <header className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Your Collections</h1>
        <p className="text-text-muted mt-1 text-sm md:text-base">Organized groups of your saved knowledge.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 relative">
        {collections.map((collection) => (
          <div key={collection._id}
            onClick={() => navigate(`/collections/${collection._id}`)}
            className="group cursor-pointer">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-accent-light rounded-2xl transform translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-bg-card border border-border-theme rounded-2xl transform translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-300 shadow-sm"></div>

              <div className="relative bg-bg-card border border-border-theme rounded-2xl p-5 shadow-sm min-h-[160px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-accent-light text-accent-text rounded-lg">
                    <Layers size={20} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenOptionModal(openOptioNModal === collection._id ? null : collection._id)
                    }}
                    className="text-text-muted hover:text-text-secondary">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-text-primary group-hover:text-indigo-600 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-text-muted text-sm line-clamp-1 mt-1">
                    {collection.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 space-y-1">
                  {collection.previewContents?.slice(0, 2).map((content, idx) => (
                    <div key={content._id || idx} className="text-[11px] text-text-muted flex items-center gap-2 truncate">
                      <div className="w-1 h-1 rounded-full bg-text-muted"></div>
                      {content.title}
                    </div>
                  ))}
                  {collection.previewContents?.length > 2 && (
                    <span className="text-[10px] text-accent-text font-bold uppercase tracking-wider">
                      +{collection.previewContents.length - 2} more items
                    </span>
                  )}

                  {openOptioNModal === collection._id && (
                    <div className="absolute top-10 right-3 w-44 bg-bg-card border border-border-theme rounded-xl shadow-xl z-50 overflow-hidden py-2">
                      <div className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase border-b border-border-light">
                        Options
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCollection(collection)
                          setIsUpdateModalOpen(true)
                          setOpenOptionModal(null)
                          setName(collection.name)
                          setDescription(collection.description)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-accent-light hover:text-accent-text transition-colors flex items-center gap-2"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation() }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {isUpdateModalOpen && (
                  <div className='fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-sm animate-in fade-in duration-200'>
                    <div className='bg-bg-card p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm border border-border-theme flex flex-col'>

                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-text-primary">Edit Collection</h2>
                        <button
                          onClick={() => setIsUpdateModalOpen(false)}
                          className="p-1 hover:bg-bg-hover rounded-lg transition-colors"
                        >
                          <X size={20} className="text-text-muted" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Name</label>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-bg-input border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Description</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-bg-input border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-text-primary"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-8">
                        <button
                          onClick={() => setIsUpdateModalOpen(false)}
                          className="flex-1 py-3 text-sm font-semibold text-text-secondary hover:bg-bg-hover rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={updateCollectionDetails}
                          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                        >
                          Save
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setCreateCollectionModalOpen(true)}
          className="border-2 border-dashed border-border-theme rounded-2xl p-6 flex flex-col items-center justify-center text-text-muted hover:border-indigo-300 hover:text-indigo-500 transition-all min-h-[220px]">
          <div className="p-3 bg-bg-hover rounded-full mb-3">
            <FolderOpen size={24} />
          </div>
          <span className="font-medium">New Collection</span>
        </button>


      </div>

      {
        createCollectionModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-backdrop backdrop-blur-sm animate-in fade-in duration-200'>
            <div className='bg-bg-card p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm border border-border-theme flex flex-col'>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-primary">New Collection</h2>
                <button
                  onClick={() => setCreateCollectionModalOpen(false)}
                  className="p-1 hover:bg-bg-hover rounded-lg transition-colors"
                >
                  <X size={20} className="text-text-muted" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-input border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-text-primary"
                    placeholder="e.g. Design Inspiration"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-input border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-text-primary"
                    placeholder="What's this for?"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setCreateCollectionModalOpen(false)}
                  className="flex-1 py-3 text-sm font-semibold text-text-secondary hover:bg-bg-hover rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCollection}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                  Create
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Collections;