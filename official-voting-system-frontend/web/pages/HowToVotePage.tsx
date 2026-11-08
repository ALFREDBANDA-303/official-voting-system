// web/pages/HowToVotePage.tsx (UPDATED)
import * as React from 'react';
import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

type HowToModal = 'HOW_TO_VOTE' | 'HOW_TO_VERIFY' | 'SECURITY' | null;

const cloudinaryPlaceholder = (publicId: string) =>
  `https://res.cloudinary.com/unihousingmw/video/upload/q_auto,f_auto/${publicId}.mp4`;

const HowToVotePage: React.FC = () => {
  const [open, setOpen] = useState<HowToModal>(null);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <Card className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-dmi-blue-900 mb-6 border-b pb-3 text-center">How To Vote</h1>

        <div className="space-y-6 text-gray-700">
          <p className="text-lg font-medium">
            Welcome to the DMI-SJBU Voting System. Follow these steps to cast a secure and verified vote.
          </p>

          <ol className="list-decimal list-inside space-y-4 ml-4">
            <li>
              <strong className="text-dmi-blue-800">Obtain Your Voucher:</strong> The Election Committee will issue a single-use
              voter voucher. Keep it private and accessible.
            </li>
            <li>
              <strong className="text-dmi-blue-800">Authenticate:</strong> Open the <span className="font-mono bg-gray-200 px-1 rounded">Verify Vote</span> page,
              enter your voucher and follow the prompts to unlock the ballot.
            </li>
            <li>
              <strong className="text-dmi-blue-800">Cast Your Ballot:</strong> Select one candidate per position. The UI enforces
              one selection per position — all selections are mandatory.
            </li>
            <li>
              <strong className="text-dmi-blue-800">Review and Submit:</strong> Carefully review the Review Page. Once you click
              Submit Ballot your choices are final.
            </li>
            <li>
              <strong className="text-dmi-blue-800">Receive Verification Code:</strong> After submission you will get a unique
              verification code. Save it — you can verify the vote later with this code.
            </li>
          </ol>

          <div className="pt-4 mt-6 border-t">
            <p className="font-semibold text-dmi-blue-800">Quick Actions</p>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setOpen('HOW_TO_VOTE')}>Watch: How to Vote</Button>
              <Button variant="secondary" onClick={() => setOpen('HOW_TO_VERIFY')}>Watch: How to vote & verify</Button>
              <Button variant="secondary" onClick={() => setOpen('SECURITY')}>Watch: Security & Privacy</Button>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t">
            <p className="font-semibold text-dmi-blue-800">Troubleshooting & Tips</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2 text-sm text-gray-600">
              <li>If your voucher is rejected, contact Technical Support immediately — do not share your voucher publicly.</li>
              <li>Keep your verification code in a safe place — it is the only way to confirm your vote later.</li>
              <li>If you lose connection while voting, your selections are saved locally; reconnect and submit.</li>
              <li>We never ask for passwords or personal identifiers when verifying votes with a verification code.</li>
            </ul>
          </div>

          <div className="pt-4 mt-6 border-t">
            <p className="font-semibold text-dmi-blue-800">Accessibility</p>
            <p className="text-sm text-gray-600">
              The voting UI is mobile-first, uses large touch targets, high-contrast text, and supports screen readers. If you need
              additional assistance, please contact the Election Committee.
            </p>
          </div>
        </div>
      </Card>

      {/* Modals holding Cloudinary-hosted videos (placeholders) */}
      <Modal
        isOpen={open === 'HOW_TO_VOTE'}
        onClose={() => setOpen(null)}
        title="How to Vote — Step by step"
      >
        {/* Cloudinary placeholder — replace publicId with your Cloudinary public ID */}
        <div className="aspect-video">
          <video controls className="w-full h-full rounded">
            <source src={cloudinaryPlaceholder('v1763589550/WhatsApp_Video_2025-11-19_at_5.51.18_PM_k7695c')} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Short walkthrough: authenticate with your voucher, select one candidate per position, review, then submit.
        </div>
      </Modal>

      <Modal
        isOpen={open === 'HOW_TO_VERIFY'}
        onClose={() => setOpen(null)}
        title="How to Verify Your Vote"
      >
        <div className="aspect-video">
          <video controls className="w-full h-full rounded">
            <source src={cloudinaryPlaceholder('v1763589526/WhatsApp_Video_2025-11-19_at_10.16.27_PM_fzpn10')} type="video/mp4" />
          </video>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Demonstration: where to find and how to use your verification code after the election.
        </div>
      </Modal>

      <Modal
        isOpen={open === 'SECURITY'}
        onClose={() => setOpen(null)}
        title="Security & Privacy Overview"
      >
        <div className="aspect-video">
          <video controls className="w-full h-full rounded">
            <source src={cloudinaryPlaceholder('security_overview_public_id')} type="video/mp4" />
          </video>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Explains the double-blind model, what data we collect, and how we protect voter anonymity.
        </div>
      </Modal>
    </div>
  );
};

export default HowToVotePage;
