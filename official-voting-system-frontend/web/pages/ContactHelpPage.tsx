// web/pages/ContactHelpPage.tsx (UPDATED)
import * as React from 'react';
import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactHelpPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <Card className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-dmi-blue-900 mb-6 border-b pb-3 text-center">Contact & Support</h1>

        <div className="space-y-8 text-gray-700">
          <p className="text-lg font-medium text-center">
            If you encounter any issues with voting, verification, or have security concerns, contact the correct team below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4 border rounded-lg shadow-sm">
              <Mail className="w-10 h-10 text-dmi-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-dmi-blue-800">Technical Support</h2>
              <p className="text-sm mt-2">Website errors, voucher acceptance issues, or upload problems.</p>
              <a href="mailto:it-support@sjbu-voting.com" className="block mt-4 text-dmi-blue-600 hover:underline font-semibold">it-support@sjbu-voting.com</a>
              <p className="text-xs text-gray-500 mt-2">Response time: typically within 2 hours during office hours.</p>
            </div>

            <div className="p-4 border rounded-lg shadow-sm">
              <Phone className="w-10 h-10 text-dmi-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-dmi-blue-800">Election Committee</h2>
              <p className="text-sm mt-2">Eligibility, rules, voucher distribution, and appeals.</p>
              <p className="block mt-4 text-dmi-blue-600 font-semibold">+265 882 760 053</p>
              <p className="text-xs text-gray-500 mt-2">Available: Fri 08:00–16:00</p>
            </div>

            <div className="p-4 border rounded-lg shadow-sm">
              <MapPin className="w-10 h-10 text-dmi-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-dmi-blue-800">Physical Location</h2>
              <p className="text-sm mt-2">Official help desk for in-person support and voucher collection.</p>
              <p className="block mt-4 text-dmi-blue-600 font-semibold">DMI SJBU Main Campus — Student Union Office</p>
              <p className="text-xs text-gray-500 mt-2">Office hours may vary on election day; follow on-campus notices.</p>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t">
            <h3 className="text-lg font-semibold text-dmi-blue-800">Escalation</h3>
            <p className="text-sm text-gray-600 mt-2">
              If your issue concerns suspected fraud or a security breach, please email the Election Committee and CC Technical Support with as much detail as possible (time, voucher ID — never share your full voucher in public, screenshots are helpful).
            </p>
          </div>

          <div className="pt-4 mt-6 border-t">
            <h3 className="text-lg font-semibold text-dmi-blue-800">Office Hours & Response Expectations</h3>
            <ul className="list-disc list-inside ml-4 text-sm text-gray-600 space-y-2 mt-2">
              <li>Technical Support: Fri 08:00–16:00 (email triage outside hours).</li>
              <li>Election Committee: Fri 09:00–16:00; extended hours on election days.</li>
              <li>In urgent security incidents, expect a response within 1 hour during business hours.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContactHelpPage;
