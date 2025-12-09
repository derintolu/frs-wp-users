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
    children: [
      {
        element: <Dashboard />,
        path: "/",
      },
      {
        element: <Dashboard />,
        path: "dashboard",
      },
      {
        element: <Inbox />,
        path: "inbox",
      },

      {
        element: <Settings />,
        path: "settings",
      },
      {
        element: <LoginPage />,
        path: "login",
      },
      {
        element: <Charts />,
        path: "charts",
      },
      {
        element: <ProfileList />,
        path: "profiles",
      },
      {
        element: <ProfileEdit />,
        path: "profiles/new",
      },
      {
        element: <ProfileView />,
        path: "profiles/:id",
      },
      {
        element: <ProfileEdit />,
        path: "profiles/:id/edit",
      },
      {
        element: <ImportExport />,
        path: "profiles/import-export",
      }
    ],
    element: <ApplicationLayout />,
    errorElement: <ErrorPage />,
    path: "/",
  },
]);
