import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './src/router';
import { AudioPlayerService } from './src/services/AudioPlayerService';

export default function App(): React.JSX.Element {
  useEffect(() => { AudioPlayerService.initialize(); }, []);
  return <RouterProvider router={router} />;
}
