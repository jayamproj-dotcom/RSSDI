import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import AppRoutes from './routes/AppRoutes';
import AppInitializer from './AppInitializer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Changed to min.css

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter basename='/'>
        <AppInitializer>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            style={{ zIndex: 9999 }} // Added z-index
            toastStyle={{
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: '#333', // Add a dark background
              color: '#fff'
            }}
          />
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  );
};

export default App;