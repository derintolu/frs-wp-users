import { Outlet } from "react-router-dom";

export default function LayoutOne() {
    // WordPress admin already has its own sidebar and header
    // Just render the page content
    return <Outlet />;
}
