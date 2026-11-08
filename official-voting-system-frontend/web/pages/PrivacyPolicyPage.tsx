// web/pages/PrivacyPolicyPage.tsx (UPDATED)
import * as React from 'react';
import { useState, useEffect } from 'react';
import Card from '../components/Card';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <Card className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-dmi-blue-900 mb-6 border-b pb-3 text-center">Privacy Policy</h1>

        <div className="space-y-6 text-gray-700">
          <p className="text-lg font-medium">
            DMI-SJBU Voting System is committed to voter anonymity, minimal data collection, and secure handling of all election data.
          </p>

          <h2 className="text-xl font-bold text-dmi-blue-800">1. What We Collect</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Voter Voucher ID:</strong> collected only to validate eligibility and redeem the ballot.</li>
            <li><strong>Vote Record (anonymous):</strong> stored without any direct link to personal identity.</li>
            <li><strong>Admin Authentication Data:</strong> Admin accounts use HTTP-only cookies and are not accessible to client scripts.</li>
          </ul>

          <h2 className="text-xl font-bold text-dmi-blue-800">2. Anonymity Model</h2>
          <p className="text-sm">
            We use a double-blind protocol: the voucher system separates eligibility verification from vote storage. The system architecture prevents linking a vote back to a voter once a ballot is cast.
          </p>

          <h2 className="text-xl font-bold text-dmi-blue-800">3. Data Retention</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Temporary voucher logs are retained only long enough to ensure vote integrity and dispute resolution.</li>
            <li>Anonymous vote records are kept as required by the university election policy.</li>
            <li>Verification codes are issued to voters and stored only to allow lookup of a matching vote record.</li>
          </ul>

          <h2 className="text-xl font-bold text-dmi-blue-800">4. Security Practices</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>All communications use HTTPS.</li>
            <li>Admin sessions use HTTP-only cookies with appropriate SameSite and Secure flags in production.</li>
            <li>Critical endpoints are rate-limited and audited.</li>
          </ul>

          <h2 className="text-xl font-bold text-dmi-blue-800">5. Your Rights</h2>
          <p className="text-sm">
            You may request clarification from the Election Committee about data usage. For concerns about privacy or suspected misuse, contact us at it-support@sjbu-voting.com.
          </p>

          <p className="pt-4 border-t mt-6 text-sm">
            By using this system you agree to this policy. The SJBU Development Team may update the policy and will publish changes as appropriate.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPolicyPage;
