import { ChevronRight } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { getIcon } from "@/utils/iconMapper";
import type { SidebarMenuItem as SidebarMenuItemType } from "@/types/menu";

export function NavMain({ items }: { items: SidebarMenuItemType[] }) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon ? getIcon(item.icon) : null;
          const isActive = item.route ? location.pathname === item.route : false;
          const hasChildren = item.items && item.items.length > 0;

          return (
            <Collapsible
              key={item.id}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {hasChildren ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                        {Icon && <Icon className="h-4 w-4" style={item.iconColor ? { color: item.iconColor } : undefined} />}
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant} className="ml-auto mr-2">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const SubIcon = subItem.icon ? getIcon(subItem.icon) : null;
                          const isSubActive = subItem.route ? location.pathname === subItem.route : false;

                          return (
                            <SidebarMenuSubItem key={subItem.id}>
                              <SidebarMenuSubButton asChild isActive={isSubActive}>
                                {subItem.isExternal ? (
                                  <a href={subItem.url} target={subItem.target}>
                                    {SubIcon && <SubIcon className="h-4 w-4" />}
                                    <span>{subItem.title}</span>
                                    {subItem.badge && (
                                      <Badge variant={subItem.badgeVariant} className="ml-auto">
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </a>
                                ) : (
                                  <Link to={subItem.route || subItem.url}>
                                    {SubIcon && <SubIcon className="h-4 w-4" />}
                                    <span>{subItem.title}</span>
                                    {subItem.badge && (
                                      <Badge variant={subItem.badgeVariant} className="ml-auto">
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    {item.isExternal ? (
                      <a href={item.url} target={item.target}>
                        {Icon && <Icon className="h-4 w-4" style={item.iconColor ? { color: item.iconColor } : undefined} />}
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant} className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    ) : (
                      <Link to={item.route || item.url}>
                        {Icon && <Icon className="h-4 w-4" style={item.iconColor ? { color: item.iconColor } : undefined} />}
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant} className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )}
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
