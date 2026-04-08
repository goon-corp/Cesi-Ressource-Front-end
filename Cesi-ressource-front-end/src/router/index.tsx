import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import ForgotPasswordPage from '@/pages/forgot-password';
import ConfirmAccountPage from '@/pages/confirm-account';

import HomePage from '@/pages/home';
import ProfilePage from '@/pages/profile';
import EditProfilePage from '@/pages/edit-profile';
import SettingsPage from '@/pages/settings';
import ResourcesPage from '@/pages/resources/index';
import ResourceDetailPage from '@/pages/resources/resource-detail';
import CreateResourcePage from '@/pages/resources/create';
import MentionsLegalesPage from '@/pages/mentions-legales';
import PolitiqueConfidentialitePage from '@/pages/politique-confidentialite';
import ConditionsUtilisationPage from '@/pages/conditions-utilisation';
import PublicProfilePage from '@/pages/public-profile';
import ErrorPage from '@/pages/error';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/confirm-email', element: <ConfirmAccountPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      { path: '/profile', element: <ProfilePage /> },
      { path: '/edit-profile', element: <EditProfilePage /> },
      { path: '/resources/create', element: <CreateResourcePage /> },
    ],
  },

  { path: '/', element: <HomePage /> },
  { path: '/resources', element: <ResourcesPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/profile/:id', element: <PublicProfilePage /> },
  { path: '/resources/:type/:slug/:id', element: <ResourceDetailPage /> },
  { path: '/resources/:id', element: <ResourceDetailPage /> },
  { path: '/mentions-legales', element: <MentionsLegalesPage /> },
  { path: '/politique-confidentialite', element: <PolitiqueConfidentialitePage /> },
  { path: '/conditions-utilisation', element: <ConditionsUtilisationPage /> },

  { path: '*', element: <ErrorPage/> },
]);