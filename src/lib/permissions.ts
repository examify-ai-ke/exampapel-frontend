import type { components } from '@/types/generated/api';

// User type from API schema
type UserRead = components['schemas']['UserRead'];

// Role types
export type UserRole = 'admin' | 'manager' | 'student' | 'guest';

// Permission types
export interface UserPermissions {
    canViewAdmin: boolean;
    canManageUsers: boolean;
    canManageRoles: boolean;
    canManageInstitutions: boolean;
    canManageFaculties: boolean;
    canManageDepartments: boolean;
    canManageExamPapers: boolean;
    canManageQuestions: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canCreateContent: boolean;
    canEditContent: boolean;
    canDeleteContent: boolean;
}

/**
 * Normalize user role from different possible formats
 */
export function normalizeUserRole(user: UserRead | null | undefined): UserRole {
    if (!user) return 'guest';

    // Handle different role formats
    const role = typeof user.role === 'string'
        ? user.role
        : user.role?.name;

    if (!role) return 'guest';

    // Normalize to lowercase and handle variations
    const normalizedRole = role.toLowerCase();

    switch (normalizedRole) {
        case 'admin':
        case 'administrator':
            return 'admin';
        case 'manager':
        case 'content_manager':
        case 'exam_manager':
            return 'manager';
        case 'student':
        case 'learner':
            return 'student';
        default:
            return 'guest';
    }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserRead | null | undefined, role: UserRole): boolean {
    return normalizeUserRole(user) === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserRead | null | undefined, roles: UserRole[]): boolean {
    const userRole = normalizeUserRole(user);
    return roles.includes(userRole);
}

/**
 * Get user permissions based on their role
 */
export function getUserPermissions(user: UserRead | null | undefined): UserPermissions {
    const role = normalizeUserRole(user);

    switch (role) {
        case 'admin':
            return {
                canViewAdmin: true,
                canManageUsers: true,
                canManageRoles: true,
                canManageInstitutions: true,
                canManageFaculties: true,
                canManageDepartments: true,
                canManageExamPapers: true,
                canManageQuestions: true,
                canViewReports: true,
                canManageSettings: true,
                canCreateContent: true,
                canEditContent: true,
                canDeleteContent: true,
            };

        case 'manager':
            return {
                canViewAdmin: false,
                canManageUsers: false,
                canManageRoles: false,
                canManageInstitutions: true,
                canManageFaculties: true,
                canManageDepartments: true,
                canManageExamPapers: true,
                canManageQuestions: true,
                canViewReports: true,
                canManageSettings: false,
                canCreateContent: true,
                canEditContent: true,
                canDeleteContent: false,
            };

        case 'student':
            return {
                canViewAdmin: false,
                canManageUsers: false,
                canManageRoles: false,
                canManageInstitutions: false,
                canManageFaculties: false,
                canManageDepartments: false,
                canManageExamPapers: false,
                canManageQuestions: false,
                canViewReports: false,
                canManageSettings: false,
                canCreateContent: false,
                canEditContent: false,
                canDeleteContent: false,
            };

        default: // guest
            return {
                canViewAdmin: false,
                canManageUsers: false,
                canManageRoles: false,
                canManageInstitutions: false,
                canManageFaculties: false,
                canManageDepartments: false,
                canManageExamPapers: false,
                canManageQuestions: false,
                canViewReports: false,
                canManageSettings: false,
                canCreateContent: false,
                canEditContent: false,
                canDeleteContent: false,
            };
    }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
    user: UserRead | null | undefined,
    permission: keyof UserPermissions
): boolean {
    const permissions = getUserPermissions(user);
    return permissions[permission];
}

/**
 * Check if user can access admin areas
 */
export function canAccessAdmin(user: UserRead | null | undefined): boolean {
    return hasAnyRole(user, ['admin']);
}

/**
 * Check if user can manage content (institutions, papers, questions)
 */
export function canManageContent(user: UserRead | null | undefined): boolean {
    return hasAnyRole(user, ['admin', 'manager']);
}

/**
 * Check if user can create content
 */
export function canCreateContent(user: UserRead | null | undefined): boolean {
    return hasPermission(user, 'canCreateContent');
}

/**
 * Check if user can edit content
 */
export function canEditContent(user: UserRead | null | undefined): boolean {
    return hasPermission(user, 'canEditContent');
}

/**
 * Check if user can delete content
 */
export function canDeleteContent(user: UserRead | null | undefined): boolean {
    return hasPermission(user, 'canDeleteContent');
}

/**
 * Get user display info
 */
export function getUserDisplayInfo(user: UserRead | null | undefined) {
    if (!user) {
        return {
            name: 'Guest User',
            email: 'guest@example.com',
            role: 'guest' as UserRole,
            displayRole: 'Guest',
        };
    }

    const role = normalizeUserRole(user);
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1);

    return {
        name: user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.email || 'Unknown User',
        email: user.email || 'unknown@example.com',
        role,
        displayRole,
    };
}
