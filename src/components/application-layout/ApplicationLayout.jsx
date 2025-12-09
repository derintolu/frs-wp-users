import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Logo from "../Icons/Logo";
import { useLocation } from "react-router-dom";
import { Icons } from "../Icons/icons";
import { clsx } from "clsx";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar/Avatar";
import { Button } from "../button/Button";
import { MenuItem, menuPopoverClass, menuContentClass } from "../menu/Menu";
import { MenuTrigger, Menu, Popover } from "react-aria-components";
import { ModeToggle } from "../mode-toggle";

const _startcase = (str) => {
  return str
    .toLowerCase() // Convert the whole string to lowercase
    .replaceAll('_', " ") // Replace underscores with spaces
    .replaceAll('-', " ") // Replace hyphens with spaces
    .split(" ") // Split the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a string
};
const navigation = [
  {
    current: true,
    href: "dashboard",
    icon: Icons.DashboardIcon,
    name: "Dashboard",
  },
  {
    current: false,
    href: "inbox",
    icon: Icons.CommonInboxIcon,
    name: "Inbox",
  },
  
  {
    current: false,
    href: "settings",
    icon: Icons.SettingsIcon,
    name: "Settings",
  },
];

const ApplicationLayout = () => {
  // const showApplicationLayout = true;
  const showApplicationLayout = !wordpressPluginBoilerplate.isAdmin;
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = location.pathname.split("/")[1];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentHoverMenu, setCurrentHoverMenu] = useState(navigation[0].href);

  const initialNavigate = useCallback(() => {
    if (pageTitle) {
      navigate(pageTitle);
    } else {
      navigate(navigation[0].href);
    }
  }, [navigate, pageTitle]);

  useEffect(() => {
    initialNavigate();
  }, [initialNavigate]);

  useEffect(() => {
    window.document.title = pageTitle ? _startcase(pageTitle) : _startcase(navigation[0].href);
  }, [pageTitle]);

  const handleLogout = (item) => {
    alert("logout");
  };

  return (
    <div className="dark:bg-gray-900">
      {showApplicationLayout ? (
        <div className="absolute h-[calc(100vh-32px)] w-full bg-white !font-sans dark:bg-gray-900">
          <div className="flex size-full  flex-row">
            <div className="border-border-default w-60 border-r">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto  bg-white pb-4 dark:bg-gray-900">
                <div className="flex h-10 shrink-0 items-center px-6 pt-4" style={{marginBottom:'3px'}}>
                  <Logo />
                  <p className="pl-2 font-sans text-lg font-semibold">
                    Plugin Name
                  </p>
                </div>

                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul className="space-y-1">
                        {navigation.map((item) => (
                          <li className="flex flex-row" key={item.name}>
                            <span
                              className={clsx(
                                "bg-transparen w-2",
                                item.href === pageTitle && "bg-gray-800",
                              )}></span>

                            <NavLink
                              className={clsx(
                                "group flex w-full gap-x-3 border-y py-2  pl-4 text-sm leading-6  focus:text-gray-700  focus:shadow-none",
                                item.href === pageTitle
                                  ? "!border-border-default font-medium text-gray-800 !shadow-border"
                                  : "border-transparent font-normal",
                              )}
                              to={item.href}>
                              <item.icon
                                aria-hidden="true"
                                className={clsx(
                                  item.href === pageTitle
                                    ? "stroke-blue-700 font-medium"
                                    : "stroke-gray-600 font-normal",
                                )}
                              />
                              {item.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            <div className="flex  w-full flex-col">
              <div className="border-border-default sticky flex h-16  items-center justify-between gap-x-4 border-b bg-white px-4 shadow-border dark:bg-gray-900 sm:gap-x-6 sm:px-6">
                <div className="text-xl font-medium">
                  {_startcase(pageTitle)}
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                  <MenuTrigger>
                    <Button intent="icon">
                      <div className="flex flex-row items-center justify-center gap-2">
                        <div className="flex gap-4">
                        <ModeToggle />
                          <Avatar>
                            <AvatarImage
                              alt={wordpressPluginBoilerplate.userInfo.username}
                              src={wordpressPluginBoilerplate.userInfo.avatar}
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="text-xs font-medium leading-none text-neutral-600">
                          {wordpressPluginBoilerplate.userInfo.username}
                        </div>
                        <div className="text-xs font-medium leading-none text-neutral-600">
                          <Icons.DownIcon />
                        </div>
                      </div>
                    </Button>

                    <Popover className={menuPopoverClass()}>
                      <Menu
                        className={menuContentClass()}
                        onSelectionChange={(key) => handleLogout("helo")}
                        selectionMode="single">
                        <MenuItem id="logout">Log out</MenuItem>
                      </Menu>
                    </Popover>
                  </MenuTrigger>
                </div>
              </div>
              <div>
                <main className="b-0 top-0  bg-white dark:bg-gray-900 ">
                  <Outlet />
                </main>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <main className="absolute h-[calc(100vh-32px)] w-full  bg-white dark:bg-gray-900">
      
              <div className="border-border-default sticky flex h-16  items-center justify-between gap-x-4 border-b bg-white px-4 shadow-border dark:bg-gray-900 sm:gap-x-6 sm:px-6">
                <div className="text-xl font-medium">
                  {_startcase(pageTitle)}
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                <ModeToggle />
                </div>
              </div>
              <div>
                <main className=" b-0  top-0 bg-white ">
                  <Outlet />
                </main>
              </div>
       
        
         
          </main>
        </div>
      )}
    </div>
  );
};

export default ApplicationLayout;
