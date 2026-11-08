import * as React from 'react';
import { useState, useEffect } from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="inline-block" role="status" aria-label="Loading">
      <svg className="animate-spin h-6 w-6 text-dmi-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>
  );
};

export default Spinner;
