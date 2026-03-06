import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Warehouse' });
    const { token } = useContext(AuthContext);

    const fetchStaff = async () => {
        const res = await axios.get('http://localhost:5000/api/auth/staff', { headers: { Authorization: `Bearer ${token}` } });
        setStaff(res.data);
    };

    const handleOnboard = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/auth/onboard', form, { headers: { Authorization: `Bearer ${token}` } });
        alert("Staff added!");
        fetchStaff();
    };

    useEffect(() => { fetchStaff(); }, []);

    return (
        <div className="container mt-4">
            <h3>Staff Management</h3>
            <form className="card p-3 mb-4" onSubmit={handleOnboard}>
                <div className="row">
                    <div className="col"><input className="form-control" placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} /></div>
                    <div className="col"><input className="form-control" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} /></div>
                    <div className="col">
                        <select className="form-control" onChange={e => setForm({...form, role: e.target.value})}>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="col"><input className="form-control" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} /></div>
                    <div className="col"><button className="btn btn-success">Add Staff</button></div>
                </div>
            </form>
            <table className="table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>{staff.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.role}</td></tr>)}</tbody>
            </table>
        </div>
    );
};
export default Staff;