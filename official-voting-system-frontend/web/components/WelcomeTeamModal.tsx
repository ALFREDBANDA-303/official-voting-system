// web/components/WelcomeTeamModal.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';

interface WelcomeTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToTeam: () => void;
}

const WelcomeTeamModal: React.FC<WelcomeTeamModalProps> = ({ isOpen, onClose, onGoToTeam }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to DMI–SJBU Elections">
      <div className="py-8 px-6 text-center">
        {/* Subtle gold accent line */}
        <div className="h-1 w-24 bg-dmi-gold-500 rounded-full mx-auto mb-8"></div>

        <h3 className="text-2xl font-bold text-dmi-blue-900 mb-4">
          Have You Met the Team Behind This Election?
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onGoToTeam} size="lg" className="font-semibold">
            Meet the Team
          </Button>
          <Button onClick={onClose} variant="secondary" size="lg">
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          This message appears only once
        </p>
      </div>
    </Modal>
  );
};

export default WelcomeTeamModal;