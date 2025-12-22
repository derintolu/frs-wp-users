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
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url: string;
    icon?: LucideIcon;
  }>;
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
              key={item.title + index}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {hasChildren ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                        {Icon && <Icon className="h-4 w-4" />}
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
                                  {SubIcon && <SubIcon className="h-4 w-4" />}
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
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link to={item.url}>
                      {Icon && <Icon className="h-4 w-4" />}
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
