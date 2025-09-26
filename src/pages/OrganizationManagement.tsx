import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Trash2, 
  Mail, 
  Crown,
  Shield,
  User,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/redux/hooks/useAuth';

import { useSubscription } from '@/redux/hooks/useSubscription';
import { useFeatureEnforcement } from '@/hooks/useFeatureEnforcement';
import { getCurrentUser } from '@/apis/auth';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/utils';

interface OrganizationUser {
  id: number;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'assistant' | 'marketer' | 'guest';
  status: 'active' | 'pending' | 'suspended';
  joined_at: string;
  last_active?: string;
}

interface OrganizationData {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  settings: any;
  created_at: string;
  users: OrganizationUser[];
  subscription: {
    plan: string;
    status: string;
    max_users: number;
  };
}

export const OrganizationManagement: React.FC = () => {
  const { user } = useAuth();
  const { isEnterpriseUser, currentPlan } = useSubscription();
  const { hasFeatureAccess, getCurrentPlan } = useFeatureEnforcement();
  
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'assistant' | 'marketer' | 'guest'>('guest');
  
  // Role change form state
  const [newRole, setNewRole] = useState<string>('');

  const loadOrganizationData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Try to load organization info and users from auth API first
      const [orgInfoResponse, usersResponse] = await Promise.allSettled([
        // TODO: Implement organization API calls with new centralized API
        // getOrganizationInfo(),
        // getOrganizationUsers()
        Promise.resolve(null),
        Promise.resolve([])
      ]);
      
      // Check if organization info was successfully loaded
      if (orgInfoResponse.status === 'fulfilled' && orgInfoResponse.value.data) {
        const orgInfo = orgInfoResponse.value.data;
        const users = usersResponse.status === 'fulfilled' ? 
          (usersResponse.value.data?.users || []) : [];
        
        setOrganizationData({
          id: orgInfo.id,
          name: orgInfo.name,
          slug: orgInfo.slug || `${orgInfo.name.toLowerCase().replace(/\s+/g, '-')}`,
          owner_id: orgInfo.admin_user_id,
          settings: orgInfo.settings || {},
          created_at: orgInfo.created_at,
          users: users.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.username || user.email,
            role: user.role,
            status: user.status,
            joined_at: user.created_at,
            last_active: user.last_active
          })),
          subscription: {
            plan: 'enterprise',
            status: 'active',
            max_users: orgInfo.sub_users_limit || 50
          }
        });
      } else {
        // Try v2 API as fallback
        console.log('Auth API failed, trying v2 API for organization data');
        try {
          // TODO: Implement organization API call with new centralized API
          // const v2OrgResponse = await getMyOrganization();
          const v2OrgResponse = null; // Temporarily disabled
          if (v2OrgResponse) {
            setOrganizationData({
              id: v2OrgResponse.id,
              name: v2OrgResponse.name,
              slug: v2OrgResponse.slug || `${v2OrgResponse.name.toLowerCase().replace(/\s+/g, '-')}`,
              owner_id: v2OrgResponse.owner_id,
              settings: {},
              created_at: v2OrgResponse.created_at,
              users: [], // v2 API might not include users in this endpoint
              subscription: {
                plan: 'enterprise',
                status: 'active',
                max_users: 50
              }
            });
          } else {
            console.log('No organization found for user:', user.id);
            setOrganizationData(null);
          }
        } catch (v2Error) {
          console.log('v2 API also failed, no organization found for user:', user.id);
          setOrganizationData(null);
        }
      }
    } catch (error) {
      console.error('Failed to load organization data:', error);
      // Don't show error toast for 404s (no organization)
      const errorResponse = error as any;
      if (errorResponse?.response?.status !== 404) {
        toast.error('Failed to load organization information');
      }
      setOrganizationData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, subscriptionApi]);

  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  const handleInviteUser = async () => {
    if (!inviteEmail || !organizationData) return;

    setIsProcessing(true);
    try {
      // Generate a temporary password for the sub-user
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      
      // TODO: Implement createSubUser with new centralized API
      // await createSubUser({
      //   email: inviteEmail,
      //   username: inviteEmail.split('@')[0],
      //   password: tempPassword,
      //   role: inviteRole
      // });

      toast.success(`Sub-user created successfully for ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('guest');
      setShowInviteModal(false);
      await loadOrganizationData();
    } catch (error) {
      console.error('Failed to create sub-user:', error);
      toast.error('Failed to create sub-user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeUserRole = async () => {
    if (!selectedUser || !newRole || !organizationData) return;

    setIsProcessing(true);
    try {
      // TODO: Implement updateUserRole with new centralized API
      // await updateUserRole(selectedUser.id, { role: newRole });

      toast.success(`Role updated for ${selectedUser.email}`);
      setSelectedUser(null);
      setNewRole('');
      setShowRoleModal(false);
      await loadOrganizationData();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${userEmail} from the organization?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement removeSubUser with new centralized API
      // await removeSubUser(userId);

      toast.success(`User ${userEmail} removed from organization`);
      await loadOrganizationData();
    } catch (error) {
      console.error('Failed to remove user:', error);
      toast.error('Failed to remove user');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'assistant':
        return 'bg-green-100 text-green-800';
      case 'marketer':
        return 'bg-purple-100 text-purple-800';
      case 'guest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canInviteUsers = hasFeatureAccess('organization_management') && 
    organizationData && 
    organizationData.users.length < organizationData.subscription.max_users;

  const canManageUsers = hasFeatureAccess('organization_management');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading organization data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organizationData) {
    const currentPlan = getCurrentPlan();
    const isEnterprise = currentPlan && typeof currentPlan === 'object' ? currentPlan.id === 'enterprise' : false;
    
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Organization Found</h3>
            <p className="text-muted-foreground mb-4">
              {isEnterprise 
                ? "You don't have an organization set up yet. Create one to start managing team members."
                : "Organization management requires an Enterprise subscription plan."
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
              {isEnterprise && (
                <Button 
                  onClick={() => {
                    // TODO: Implement organization creation
                    toast.info('Organization creation feature coming soon!');
                  }}
                  variant="default"
                >
                  Create Organization
                </Button>
              )}
              {!isEnterprise && (
                <Button 
                  onClick={() => {
                    // Navigate to subscription page
                    window.location.href = '/subscription';
                  }}
                  variant="default"
                >
                  Upgrade to Enterprise
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and organization settings
          </p>
        </div>
        {canInviteUsers && (
          <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite User to Organization</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="marketer">Marketer</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser} disabled={isProcessing || !inviteEmail}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Organization Name</h3>
              <p className="text-muted-foreground">{organizationData.name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Current Plan</h3>
              <Badge className="bg-blue-100 text-blue-800">
                {organizationData.subscription.plan}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">User Limit</h3>
              <p className="text-muted-foreground">
                {organizationData.users.length} / {organizationData.subscription.max_users} users
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage your organization's team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizationData.users.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{member.name}</h3>
                      {member.id.toString() === user?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-xs", getRoleColor(member.role))}>
                        {member.role}
                      </Badge>
                      <Badge className={cn("text-xs", getStatusColor(member.status))}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {member.last_active && (
                    <span className="text-xs text-muted-foreground">
                      Last active: {new Date(member.last_active).toLocaleDateString()}
                    </span>
                  )}
                  
                  {canManageUsers && member.id.toString() !== user?.id && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(member);
                          setNewRole(member.role);
                          setShowRoleModal(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(member.id, member.email)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newRole">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="marketer">Marketer</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangeUserRole} 
              disabled={isProcessing || !newRole || newRole === selectedUser?.role}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
