import { createHashRouter } from "react-router-dom";
import ApplicationLayout from "../components/application-layout/LayoutOne";
import Settings from "./pages/settings";
import ErrorPage from "./pages/error/Error";
import Inbox from "./pages/inbox";
import Dashboard from "./pages/dashboard";
import LoginPage from "./pages/login";
import Charts from "./pages/charts";
import ProfileList from "./pages/profiles/ProfileList";
import ProfileView from "./pages/profiles/ProfileView";
import ProfileEdit from "./pages/profiles/ProfileEdit";
import ImportExport from "./pages/profiles/ImportExport";

export const router = createHashRouter([
  {
    path: "/",
    element: <ApplicationLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "inbox",
        element: <Inbox />,
      },

      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "charts",
        element: <Charts />,
      },
      {
        path: "profiles",
        element: <ProfileList />,
      },
      {
        path: "profiles/new",
        element: <ProfileEdit />,
      },
      {
        path: "profiles/:id",
        element: <ProfileView />,
      },
      {
        path: "profiles/:id/edit",
        element: <ProfileEdit />,
      },
      {
        path: "profiles/import-export",
        element: <ImportExport />,
      }
    ],
  },
]);
