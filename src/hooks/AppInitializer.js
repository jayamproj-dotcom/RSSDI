// AppInitializer.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const adminUser = localStorage.getItem('adminUser');
      const googleUser = localStorage.getItem('googleUser');

      if (adminUser) {
        const { user, token } = JSON.parse(adminUser);
        dispatch(setCredentials({ user, token, role: 'admin' }));
      } else if (googleUser) {
        const user = JSON.parse(googleUser);
        dispatch(setCredentials({ user, token: user.token, role: 'doctor' }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }, [dispatch]);

  return children;
};

export default AppInitializer;
