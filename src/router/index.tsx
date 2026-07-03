import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../Layout';
import { LibraryPage } from '@pages/LibraryPage';
import { AlbumsPage } from '@pages/AlbumsPage';
import { ArtistsPage } from '@pages/ArtistsPage';
import { SearchPage } from '@pages/SearchPage';
import { NowPlayingPage } from '@pages/NowPlayingPage';
import { PlaylistsPage } from '@pages/PlaylistsPage';
import { PlaylistDetailPage } from '@pages/PlaylistDetailPage';
import { QueuePage } from '@pages/QueuePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LibraryPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'albums', element: <AlbumsPage /> },
      { path: 'artists', element: <ArtistsPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'playlists', element: <PlaylistsPage /> },
      { path: 'playlists/:id', element: <PlaylistDetailPage /> },
    ],
  },
  { path: '/now-playing', element: <NowPlayingPage /> },
  { path: '/queue', element: <QueuePage /> },
]);
