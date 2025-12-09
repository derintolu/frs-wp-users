import { createHashRouter } from "react-router-dom";

import ErrorPage from "@/frontend/pages/error/Error";


import Home from "@/frontend/pages/home/index";

export const router = createHashRouter([
  {
    element: <Home />,
    errorElement: <ErrorPage />,
    path: "/",
   
  },
]);
