import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', status: 'pending', priority: 'medium' });

    // Fetch user and tasks on mount
    useEffect(() => {
        fetchUser();
        fetchTasks();
    }, []);

    // Auto-clear messages
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
        } catch {
            navigate('/login');
        }
    };

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data.tasks);
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to fetch tasks', 'error');
        }
    };

    const showMsg = (text, type) => setMessage({ text, type });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({ title: '', description: '', status: 'pending', priority: 'medium' });
        setEditingTask(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                const { data } = await api.put(`/tasks/${editingTask._id}`, form);
                showMsg(data.message, 'success');
            } else {
                const { data } = await api.post('/tasks', form);
                showMsg(data.message, 'success');
            }
            resetForm();
            fetchTasks();
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                showMsg(errors.map(e => e.message).join(', '), 'error');
            } else {
                showMsg(err.response?.data?.message || 'Operation failed', 'error');
            }
        }
    };

    const handleEdit = (task) => {
        setForm({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority
        });
        setEditingTask(task);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const { data } = await api.delete(`/tasks/${id}`);
            showMsg(data.message, 'success');
            fetchTasks();
        } catch (err) {
            showMsg(err.response?.data?.message || 'Delete failed', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const getStatusClass = (status) => {
        if (status === 'completed') return 'status-completed';
        if (status === 'in-progress') return 'status-progress';
        return 'status-pending';
    };

    const getPriorityClass = (priority) => {
        if (priority === 'high') return 'priority-high';
        if (priority === 'low') return 'priority-low';
        return 'priority-medium';
    };

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard">
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-brand">
                    <h2>TaskManager</h2>
                </div>
                <div className="nav-user">
                    <span className="user-badge">{user.role}</span>
                    <span className="user-name">{user.username}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <main className="main-content">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>My Tasks</h1>
                        <p className="task-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button className="btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                        {showForm ? 'Cancel' : '+ New Task'}
                    </button>
                </div>

                {/* Messages */}
                {message.text && (
                    <div className={`message ${message.type}`}>{message.text}</div>
                )}

                {/* Task Form */}
                {showForm && (
                    <div className="task-form-card">
                        <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="Task title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Task description (optional)"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select id="status" name="status" value={form.status} onChange={handleChange}>
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="priority">Priority</label>
                                    <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary">
                                {editingTask ? 'Update Task' : 'Create Task'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Task List */}
                <div className="task-list">
                    {tasks.length === 0 ? (
                        <div className="empty-state">
                            <p>No tasks yet. Create your first task!</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task._id} className="task-card">
                                <div className="task-header">
                                    <h3 className="task-title">{task.title}</h3>
                                    <div className="task-actions">
                                        <button className="btn-edit" onClick={() => handleEdit(task)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(task._id)}>Delete</button>
                                    </div>
                                </div>
                                {task.description && <p className="task-desc">{task.description}</p>}
                                <div className="task-meta">
                                    <span className={`badge ${getStatusClass(task.status)}`}>{task.status}</span>
                                    <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                                    <span className="task-date">{new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
