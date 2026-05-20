import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATIC_RULES = [
    { test: (v) => v.length >= 8, label: 'At least 8 characters' },
    { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
    { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
    { test: (v) => /[0-9]/.test(v), label: 'One number' },
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Force username to lowercase, no spaces
        if (name === 'username') {
            setForm({ ...form, [name]: value.toLowerCase().replace(/\s/g, '') });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    // ── Inline validation ────────────────────────────────
    const getUsernameError = () => {
        if (!form.username) return 'Username is required';
        if (form.username.length < 3) return 'Must be at least 3 characters';
        if (form.username.length > 30) return 'Must be under 30 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return 'Only letters, numbers, and underscores';
        return '';
    };

    const getEmailError = () => {
        if (!form.email) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format';
        return '';
    };

    // Dynamic rules that depend on current form values
    const passwordRules = [
        ...STATIC_RULES,
        { test: (v) => !form.username || !v.toLowerCase().includes(form.username.toLowerCase()), label: 'Must not contain your username' },
        { test: (v) => !form.email || !v.toLowerCase().includes(form.email.split('@')[0].toLowerCase()), label: 'Must not contain your email' },
    ];

    const isPasswordValid = passwordRules.every(r => r.test(form.password));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ username: true, email: true, password: true });

        // Check frontend validation before sending
        if (getUsernameError() || getEmailError() || !isPasswordValid) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const { data } = await api.post('/auth/register', form);
            localStorage.setItem('access_token', data.token.access_token);
            setMessage({ text: data.message, type: 'success' });
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            const errors = err.response?.data?.errors;
            if (errors) {
                setMessage({ text: errors.map(e => e.message).join(', '), type: 'error' });
            } else {
                setMessage({ text: msg, type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    const usernameError = touched.username ? getUsernameError() : '';
    const emailError = touched.email ? getEmailError() : '';

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Start managing your tasks today</p>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>{message.text}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="e.g. john_doe"
                            value={form.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={usernameError ? 'input-error' : ''}
                        />
                        {usernameError && <span className="field-error">{usernameError}</span>}
                        {!usernameError && touched.username && form.username && (
                            <span className="field-hint">Letters, numbers, underscores only</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="e.g. john@example.com"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={emailError ? 'input-error' : ''}
                        />
                        {emailError && <span className="field-error">{emailError}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a strong password"
                            value={form.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {form.password && (
                            <div className="password-rules">
                                {passwordRules.map((rule, i) => (
                                    <div key={i} className={`rule ${rule.test(form.password) ? 'rule-pass' : 'rule-fail'}`}>
                                        <span className="rule-icon">{rule.test(form.password) ? '✓' : '○'}</span>
                                        {rule.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}
