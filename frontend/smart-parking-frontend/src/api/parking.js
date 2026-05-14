export const getHistory = async () => {
  const res = await fetch('http://localhost:5000/api/parking/history', {
    credentials: 'include'
  });
  return await res.json();
};