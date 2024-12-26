import * as React from 'react';
import './App.css';
import './assets/global_style.scss';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import CustomToastContainer from './components/CustomToastContainer';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home></Home>,
  },
]);

function App() {
  return (
    <div className="App p-5">
       <RouterProvider router={router} />
       <CustomToastContainer/>
    </div>
  );
}

export default App;
