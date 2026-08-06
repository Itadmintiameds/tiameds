
export interface NavigationItem {
    name: string;
    href?: string;
    icon?: React.ElementType;
    current: boolean;
    hasActiveChild?: boolean;
    // Roles allowed to see this item; omit/leave empty to allow every authenticated role.
    allowedRoles?: string[];
    children?: (Omit<NavigationItem, "children"> & { icon?: React.ElementType })[];
}





// old code written by abhishek....... do not delete it.............
// export interface NavigationItem {
//     name: string;
//     href?: string;
//     icon?: React.ElementType;
//     current: boolean;
//     hasActiveChild?: boolean;
//     children?: (Omit<NavigationItem, "children"> & { icon?: React.ElementType })[];
// } 