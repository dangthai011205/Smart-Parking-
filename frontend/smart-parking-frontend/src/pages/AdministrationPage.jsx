import React, { useEffect, useState } from 'react';
import './administration.css';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import { getUsers, updateUserRole } from '../api/admin';

export default function AdministrationPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getUsers();
        if (!response.success) throw new Error(response.message || 'Cannot load users');
        setUsers(response.users || []);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách tài khoản.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      const response = await updateUserRole(userId, newRole);
      if (!response.success) throw new Error(response.message || 'Unable to update role');
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert('Cập nhật vai trò thất bại: ' + err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="administration-container">
      <TopNav user={user} />

      <div className="administration-main">
        <div className="content-wrapper">
          <h1>Administration</h1>
          <p className="subtitle">Danh sách tài khoản và quyền truy cập</p>

          {loading && <div className="status-message">Đang tải dữ liệu...</div>}
          {error && <div className="status-message error">{error}</div>}

          {!loading && !error && (
            <div className="card">
              <div className="table-header">
                <h2>User Management</h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={updatingUserId === u.id}
                        >
                          <option value="admin">admin</option>
                          <option value="operator">operator</option>
                          <option value="member">member</option>
                        </select>
                      </td>
                      <td>{u.status || 'Active'}</td>
                      <td>
                        <button className="edit" disabled={updatingUserId === u.id}>
                          {updatingUserId === u.id ? 'Updating…' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
