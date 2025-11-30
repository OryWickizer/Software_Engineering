import { useEffect, useState } from 'react';

export default function EmailVerification() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const backendURL = "http://localhost:8000";

  useEffect(() => {
    const verifyEmail = async () => {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');
      const token = urlParams.get('token');

      if (!email || !token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch(
          `${backendURL}/api/auth/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
          {
            method: 'GET',
            headers: { 'Accept': 'application/json, text/html' }
          }
        );

        // Attempt to parse JSON first; if the server returned HTML (clicked link
        // in browser), fall back to reading text.
        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (response.ok) {
          setStatus('success');
          // If JSON, use message field; if HTML/text, show a friendly message
          setMessage(typeof data === 'string' ? 'Your email has been verified successfully!' : (data.message || 'Your email has been verified successfully!'));

          // Redirect to home after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          setStatus('error');
          if (typeof data === 'string') {
            // Try to extract a short message from the HTML/text
            const plain = data.replace(/<[^>]+>/g, ' ').trim();
            setMessage(plain || 'Verification failed. The link may be expired or invalid.');
          } else {
            setMessage(data.detail || 'Verification failed. The link may be expired or invalid.');
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #fff7ed, #fee2e2)',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '1.5rem' 
          }}>
            {status === 'verifying' && (
              <div style={{
                width: '4rem',
                height: '4rem',
                border: '4px solid #fed7aa',
                borderTopColor: '#f97316',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {status === 'success' && (
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            {status === 'error' && (
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
          
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: '#1f2937'
          }}>
            {status === 'verifying' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>
          
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {status === 'verifying' && 'Please wait while we verify your email address...'}
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              marginBottom: '1rem' 
            }}>
              Redirecting to login page in 3 seconds...
            </p>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
            >
              Go to Login Now
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
            >
              Return to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}