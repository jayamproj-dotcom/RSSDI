import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from './features/auth/authSlice';

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const adminUser = sessionStorage.getItem('adminUser');
    const googleUser = sessionStorage.getItem('googleUser');

    if (adminUser) {
      const { user, token } = JSON.parse(adminUser);
      dispatch(setCredentials({ user, token, role: 'admin' }));
    } else if (googleUser) {
      const parsedUser = JSON.parse(googleUser); // already includes token
      dispatch(setCredentials({ user: parsedUser, token: parsedUser.token, role: 'user' }));
    }
  }, [dispatch]);

  return children;
};

export default AppInitializer;
