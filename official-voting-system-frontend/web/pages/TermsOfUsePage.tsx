// web/pages/TermsOfUsePage.tsx (UPDATED)
import * as React from 'react';
import { useState, useEffect } from 'react';
import Card from '../components/Card';

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <Card className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-dmi-blue-900 mb-6 border-b pb-3 text-center">Terms of Use</h1>

        <div className="space-y-6 text-gray-700">
          <p className="text-lg font-medium">
            These terms govern your use of the DMI-SJBU Voting System. By using the system you accept these terms.
          </p>

          <h2 className="text-xl font-bold text-dmi-blue-800">1. Eligibility</h2>
          <p>Only individuals issued a unique, verifiable voter voucher by the DMI-SJBU Election Committee may use this system to vote.</p>

          <h2 className="text-xl font-bold text-dmi-blue-800">2. Single Vote Rule</h2>
          <p>Each eligible voter may cast a ballot once. Attempting to vote multiple times using fraudulent vouchers is prohibited and may result in disciplinary action.</p>

          <h2 className="text-xl font-bold text-dmi-blue-800">3. Finality of Submission</h2>
          <p>Once you confirm and submit your ballot it is recorded immediately and cannot be changed or retracted. Ensure your Review Page selections are correct before submitting.</p>

          <h2 className="text-xl font-bold text-dmi-blue-800">4. Prohibited Actions</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Tampering with application code, network traffic, or attempting to bypass authentication.</li>
            <li>Bulk creation or sale of vouchers.</li>
            <li>Distribution of voter vouchers or verification codes in public forums.</li>
          </ul>

          <h2 className="text-xl font-bold text-dmi-blue-800">5. Enforcement</h2>
          <p>
            Violations of these terms may be referred to University disciplinary processes. The Election Committee reserves the right to invalidate votes found to originate from fraudulent activity.
          </p>

          <p className="pt-4 border-t mt-6 text-sm">
            Continued use of this system constitutes agreement to these Terms of Use.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TermsOfUsePage;
