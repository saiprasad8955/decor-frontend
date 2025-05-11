import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';
// import { element } from 'prop-types';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));
const PageTwo = lazy(() => import('src/pages/dashboard/two'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { path: 'customers', element: <IndexPage /> },
      { path: 'items', element: <PageTwo /> },
      { path: 'invoices', element: <PageThree /> },
      // {
      //   path: 'group',
      //   children: [
      //     { element: <PageFour />, index: true },
      //     { path: 'five', element: <PageFive /> },
      //     { path: 'six', element: <PageSix /> },
      //   ],
      // },
    ],
  },
];
