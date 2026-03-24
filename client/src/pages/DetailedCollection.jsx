import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Layers, FileText, Video, ExternalLink } from 'lucide-react'
import { fetchCollectionById } from '../api/collection.api'

const DetailedCollection = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getCollection = async () => {
      try {
        const res = await fetchCollectionById(id)
        setCollection(res.data.collection)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    getCollection()
  }, [id])

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  )

  if (!collection) return (
    <div className="flex h-full items-center justify-center text-text-muted">
      Collection not found.
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="p-2 hover:bg-bg-hover rounded-full transition-colors flex-none pb-3"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <div className="bg-bg-card border border-border-theme rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-light text-accent-text rounded-xl">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{collection.name}</h1>
            <p className="text-text-muted text-sm mt-0.5">{collection.description || 'No description provided.'}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border-light text-xs text-text-muted">
          {collection.contents?.length || 0} items · Created {new Date(collection.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Contents */}
      <div className="space-y-3">
        {collection.contents?.length === 0 && (
          <div className="text-center py-16 text-text-muted text-sm">
            No contents in this collection yet.
          </div>
        )}

        {collection.contents?.map((item) => (
          <div
            key={item._id}
            onClick={() => navigate(`/content/${item._id}`)}
            className="group bg-bg-card border border-border-theme rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`p-2 rounded-lg shrink-0 ${item.type === 'video' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                {item.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-indigo-600 transition-colors truncate">
                  {item.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {item.tags?.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-accent-text uppercase">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-muted hover:text-text-secondary"
            >
              <ExternalLink size={15} />
            </a>
          </div>
        ))}
      </div>

    </div>
  )
}

export default DetailedCollection