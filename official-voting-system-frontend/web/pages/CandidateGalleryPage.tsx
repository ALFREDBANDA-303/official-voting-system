// web/pages/CandidateGalleryPage.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAllPositions } from '../hooks/useAllPositions';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Candidate, Position } from '../types';

interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

interface CandidateModalState {
  isOpen: boolean;
  candidate: Candidate | null;
  positionName: string;
}

const CandidateGalleryPage: React.FC = () => {
  const { positions, isLoading, error, fetchPositions } = useAllPositions();

  const [modalState, setModalState] = useState<CandidateModalState>({
    isOpen: false,
    candidate: null,
    positionName: '',
  });

  // New: separate modal for full-image viewer
  const [imageViewer, setImageViewer] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: '',
    alt: '',
  });

  const openManifestoModal = (candidate: Candidate, positionName: string) => {
    setModalState({
      isOpen: true,
      candidate,
      positionName,
    });
  };

  const closeManifestoModal = () => {
    setModalState({
      isOpen: false,
      candidate: null,
      positionName: '',
    });
  };

  const openImageViewer = (src: string, alt: string) => {
    setImageViewer({ isOpen: true, src, alt });
  };

  const closeImageViewer = () => {
    setImageViewer({ isOpen: false, src: '', alt: '' });
  };

  const defaultPlaceholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23ccc'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-size='18' fill='%23666'%3E?%3C/text%3E%3C/svg%3E";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
        <Spinner />
        <p className="ml-4 text-dmi-blue-800 font-medium">Loading candidate gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-2xl mx-auto p-6 text-center bg-red-50 border-red-400">
          <h2 className="text-2xl font-bold text-red-700">Data Error</h2>
          <p className="text-red-600 mt-4">{error}</p>
          <Button onClick={fetchPositions} className="mt-4">Retry Load</Button>
        </Card>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-2xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold text-dmi-blue-900">No Candidates Found</h2>
          <p className="text-base-mobile text-gray-600 mt-4">The election setup is incomplete. Please check back later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-dmi-blue-900">Candidate Gallery</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">View the manifestos and official photos for all candidates.</p>
      </div>

      <div className="space-y-8">
        {positions.map((position) => (
          <Card key={position.id} className="p-4">
            <h2 className="text-xl md:text-2xl font-bold text-dmi-blue-900 mb-4 border-b pb-2">{position.name}</h2>

            {position.candidates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {position.candidates.map((candidate) => {
                  const src = candidate.imageUrl?.trim() || defaultPlaceholder;
                  return (
                    <div key={candidate.id} className="text-center border rounded-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                      <div className="bg-gray-100 p-4 flex justify-center">
                        {/* Clickable image opens the full image viewer */}
                        <button
                          type="button"
                          onClick={() => openImageViewer(src, candidate.name)}
                          className="focus:outline-none"
                          aria-label={`View full image of ${candidate.name}`}
                        >
                          <img
                            src={src}
                            alt={candidate.name}
                            className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 object-cover rounded-full border-4 border-white shadow-md transform hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const t = e.currentTarget;
                              if (t.src !== defaultPlaceholder) t.src = defaultPlaceholder;
                            }}
                          />
                        </button>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-dmi-blue-800">{candidate.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-3">Position: {position.name}</p>

                        <div className="flex justify-center gap-3">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openManifestoModal(candidate, position.name)}
                          >
                            View Manifesto
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openImageViewer(src, candidate.name)}
                          >
                            View Photo
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No candidates registered for this position yet.</p>
            )}
          </Card>
        ))}
      </div>

      {/* Manifesto Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeManifestoModal}
        title={`Manifesto: ${modalState.candidate?.name || ''} (${modalState.positionName})`}
      >
        <div className="max-h-80 overflow-y-auto p-2">
          <p className="text-gray-700 whitespace-pre-wrap text-sm">
            {modalState.candidate?.manifesto || 'Manifesto not available.'}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t flex justify-end">
          <Button onClick={closeManifestoModal}>Close</Button>
        </div>
      </Modal>

      {/* Image Viewer Modal (full-size) */}
      <Modal
        isOpen={imageViewer.isOpen}
        onClose={closeImageViewer}
        title={imageViewer.alt || 'Candidate Photo'}
      >
        <div className="flex flex-col items-center">
          <div className="max-w-full max-h-[65vh] overflow-hidden">
            <img
              src={imageViewer.src}
              alt={imageViewer.alt}
              className="max-w-full max-h-[65vh] object-contain rounded-md"
              onError={(e) => {
                const t = e.currentTarget;
                if (t.src !== defaultPlaceholder) t.src = defaultPlaceholder;
              }}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <a
              href={imageViewer.src}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 bg-dmi-blue-700 text-white rounded-btn text-sm"
            >
              Open in new tab
            </a>
            <Button onClick={closeImageViewer}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateGalleryPage;
