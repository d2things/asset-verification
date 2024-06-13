import React, { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to Main Website URL
    window.location.href = 'https://cryodao.org';
  }, []);

  return (
    <div>
      <p>Redirecting to CryoDao</p>
    </div>
  );
};

