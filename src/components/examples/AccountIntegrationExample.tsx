import React, { useState } from 'react';
import { useUserQuery } from '@/hooks/useUserQuery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, User, Settings, Bell, Shield, CreditCard } from 'lucide-react';
import { UserUpdate, UserPreferences } from '@/api/userService';

/**
 * Example component showing how to integrate the user API hooks
 * This demonstrates user profile management, preferences, and subscription handling
 */
export const AccountIntegrationExample: React.FC = () => {
  const [profileData, setProfileData] = useState<UserUpdate>({});
  const [preferencesData, setPreferencesData] = useState<Partial<UserPreferences>>({});

  // Queries
  const { data: userProfile, isLoading: profileLoading } = useUserQuery().useUserProfile();
  const { data: userStats, isLoading: statsLoading } = useUserQuery().useUserStats();
  const { data: userPreferences, isLoading: preferencesLoading } = useUserQuery().useUserPreferences();
  const { data: userActivity } = useUserQuery().useUserActivity(10);
  const { data: subscription } = useUserQuery().useUserSubscription();
  const { data: maintenanceStatus } = useUserQuery().useMaintenanceStatus();

  // Mutations
  const updateProfileMutation = useUserQuery().useUpdateProfile();
  const updatePreferencesMutation = useUserQuery().useUpdateUserPreferences();
  const updatePasswordMutation = useUserQuery().useUpdatePassword();
  const uploadAvatarMutation = useUserQuery().useUploadAvatar();
  const updateSubscriptionMutation = useUserQuery().useUpdateSubscription();
  const cancelSubscriptionMutation = useUserQuery().useCancelSubscription();

  const handleUpdateProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(profileData);
      setProfileData({});
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await updatePreferencesMutation.mutateAsync(preferencesData);
      setPreferencesData({});
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadAvatarMutation.mutateAsync(file);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    }
  };

  const handleSubscriptionChange = async (plan: string) => {
    try {
      await updateSubscriptionMutation.mutateAsync(plan);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await cancelSubscriptionMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and subscription
        </p>
      </div>

      {/* System Status */}
      {maintenanceStatus && (
        <Card className={maintenanceStatus.maintenance_mode ? 'border-yellow-200 bg-yellow-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-medium">
                {maintenanceStatus.maintenance_mode ? 'Maintenance Mode Active' : 'System Operational'}
              </span>
            </div>
            {maintenanceStatus.message && (
              <p className="text-sm text-muted-foreground mt-1">
                {maintenanceStatus.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : userProfile ? (
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    {userProfile.avatar ? (
                      <img 
                        src={userProfile.avatar} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={uploadAvatarMutation.isPending}
                    >
                      {uploadAvatarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder={userProfile.username}
                    value={profileData.username || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={userProfile.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder={userProfile.first_name || 'Enter first name'}
                    value={profileData.first_name || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder={userProfile.last_name || 'Enter last name'}
                    value={profileData.last_name || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isPending || Object.keys(profileData).length === 0}
              >
                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load profile</p>
          )}
        </CardContent>
      </Card>

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{userStats.total_books}</p>
                <p className="text-sm text-muted-foreground">Total Books</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{userStats.published_books}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">${userStats.total_revenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{userStats.account_age_days}</p>
                <p className="text-sm text-muted-foreground">Days Active</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No statistics available</p>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status}
                    </Badge>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select onValueChange={handleSubscriptionChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Change Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  {subscription.status === 'active' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={cancelSubscriptionMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              
              {subscription.features && subscription.features.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Plan Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {subscription.features.map((feature) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No subscription information available</p>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize your application experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferencesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : userPreferences ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Theme</Label>
                  <Select 
                    value={preferencesData.theme || userPreferences.theme}
                    onValueChange={(value) => setPreferencesData(prev => ({ ...prev, theme: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Language</Label>
                  <Select 
                    value={preferencesData.language || userPreferences.language}
                    onValueChange={(value) => setPreferencesData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your books and account
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.email_notifications ?? userPreferences.email_notifications}
                    onCheckedChange={(checked) => setPreferencesData(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.push_notifications ?? userPreferences.push_notifications}
                    onCheckedChange={(checked) => setPreferencesData(prev => ({ ...prev, push_notifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and product updates
                    </p>
                  </div>
                  <Switch
                    checked={preferencesData.marketing_emails ?? userPreferences.marketing_emails}
                    onCheckedChange={(checked) => setPreferencesData(prev => ({ ...prev, marketing_emails: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleUpdatePreferences}
                disabled={updatePreferencesMutation.isPending || Object.keys(preferencesData).length === 0}
              >
                {updatePreferencesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load preferences</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {userActivity && userActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
