export interface License {
    id: string;
    type: 'basic' | 'premium' | 'enterprise';
    maxUsers: number;
    features: string[];
    expiresAt: string;
}

export interface Company {
    id: string;
    name: string;
    cnpj: string;
    licenseId: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceUser {
    id: string;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'user';
    status: 'active' | 'invited' | 'disabled';
    lastAccess?: string;
}

export interface Workspace {
    id: string;
    companyId: string;
    name: string;
    ownerId: string;
    users: WorkspaceUser[];
    settings: {
        allowUserInvite: boolean;
        allowDashboardSharing: boolean;
        allowExport: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceStats {
    totalUsers: number;
    activeUsers: number;
    pendingInvites: number;
    licenseUsage: number;
} 