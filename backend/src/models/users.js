// hiện tại dùng dummy array
const users = [
  {
    id: 1,
    username: 'admin@parking.com',
    password: 'admin123',
    name: 'Admin',
    email: 'admin@parking.com', 
    role: 'admin',
    status: 'Active'
  },
  {
    id: 2,
    username: 'operator@parking.com',
    password: 'operator123',
    name: 'Parking Operator',
    email: 'operator@parking.com',
    role: 'operator',
    status: 'Active'
  },
  {
    id: 3,
    username: 'user@parking.com',
    password: 'user123',
    name: 'Normal User',
    email: 'user@parking.com',
    role: 'member',
    status: 'Active'
  }
];
module.exports = users;