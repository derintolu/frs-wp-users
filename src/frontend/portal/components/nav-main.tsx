import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Simplified type for menu items
interface SidebarMenuItemType {
  icon?: LucideIcon;
  isActive?: boolean;
  items?: Array<{
    icon?: LucideIcon;
    title: string;
    url: string;
  }>;
  title: string;
  url: string;
}

export function NavMain({ items }: { items: SidebarMenuItemType[] }) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.url || item.isActive;
          const hasChildren = item.items && item.items.length > 0;

          return (
            <Collapsible
              asChild
              className="group/collapsible"
              defaultOpen={isActive}
              key={item.title + index}
            >
              <SidebarMenuItem>
                {hasChildren ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                        {Icon && <Icon className="size-4" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem, subIndex) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = location.pathname === subItem.url;

                          return (
                            <SidebarMenuSubItem key={subItem.title + subIndex}>
                              <SidebarMenuSubButton asChild isActive={isSubActive}>
                                <Link to={subItem.url}>
                                  {SubIcon && <SubIcon className="size-4" />}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link to={item.url}>
                      {Icon && <Icon className="size-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
