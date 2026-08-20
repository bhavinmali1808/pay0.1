'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: '',
    loginUrl: '',
    loginId: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.loginId, phone: formData.phoneNumber }),
      });

      if (response.status === 429) {
        setMessage({ type: 'error', text: 'Too many requests. Please try again later.' });
      } else if (response.ok) {
        setMessage({ type: 'success', text: 'OTP sent successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to send OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <form onSubmit={handleGetOTP}>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              First Name <span className={styles.required}>*</span>
            </label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName}
              onChange={handleChange}
              className={styles.input} 
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Last Name <span className={styles.required}>*</span>
            </label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName}
              onChange={handleChange}
              className={styles.input} 
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber}
              onChange={handleChange}
              className={styles.input} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Company Name <span className={styles.required}>*</span>
            </label>
            <input 
              type="text" 
              name="companyName" 
              value={formData.companyName}
              onChange={handleChange}
              className={styles.input} 
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Login URL <span className={styles.required}>*</span>
            </label>
            <div className={styles.urlInputContainer}>
              <input 
                type="text" 
                name="loginUrl" 
                value={formData.loginUrl}
                onChange={handleChange}
                className={styles.urlInput} 
                required
              />
              <span className={styles.urlSuffix}>.greythr.com</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Login ID <span className={styles.required}>*</span>
            </label>
            <input 
              type="email" 
              name="loginId" 
              value={formData.loginId}
              onChange={handleChange}
              className={styles.input} 
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Password <span className={styles.required}>*</span>
            </label>
            <div className={styles.passwordContainer}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${styles.passwordInput}`} 
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className={styles.toggleVisibility}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Get OTP'}
          </button>

          {message.text && (
            <div className={message.type === 'error' ? styles.errorText : styles.successText}>
              {message.text}
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
