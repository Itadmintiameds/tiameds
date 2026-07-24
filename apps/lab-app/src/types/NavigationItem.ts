
export interface NavigationItem {
    name: string;
    href?: string;
    icon?: React.ElementType;
    current: boolean;
    hasActiveChild?: boolean;
    children?: (Omit<NavigationItem, "children"> & { icon?: React.ElementType })[];
} 

