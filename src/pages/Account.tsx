import React, { useState, useEffect } from 'react';
import { User, Settings, CreditCard, Bell, Shield, HelpCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useUserApi } from '@/hooks/useUserApi';
import { useSubscriptionApi } from '@/hooks/useSubscriptionApi';
import { ROLES, SUBSCRIPTION_PLANS } from '@/lib/constants';
import { toast } from '@/lib/toast';
import { SubscriptionPlansModal } from '@/components/subscription/SubscriptionPlansModal';
import { BillingHistory } from '@/components/subscription/BillingHistory';

export const Account: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const userApi = useUserApi();
  const subscriptionApi = useSubscriptionApi();

  console.log("its My User : ",user);
  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName:user?.username || '',
    lastName: '',
    email: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    pushNotifications: true,
    weeklyReports: true,
    timezone: 'UTC-5 (Eastern Time)',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD ($)'
  });

  const [subscription, setSubscription] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      // Initialize form with user data
      const nameParts = user.name?.split(' ') || ['', ''];
      setProfileForm({
        firstName: nameParts[0] || '',
        lastName: nameParts[1] || '',
        email: user.email || ''
      });

      // Load additional data
      loadUserData();
    } else {
      // If no user, try to refresh user data
      refreshUserData();
    }
  }, [user, refreshUserData]);

  const loadUserData = async () => {
    try {
      const [subscriptionData, statsData, preferencesData] = await Promise.all([
        userApi.getSubscription(),
        userApi.getUserStats(),
        userApi.getUserPreferences()
      ]);

      if (subscriptionData) setSubscription(subscriptionData);
      if (statsData) setUserStats(statsData);
      if (preferencesData) {
        setPreferences(prev => ({
          ...prev,
          emailNotifications: preferencesData.email_notifications,
          marketingEmails: preferencesData.marketing_emails,
          pushNotifications: preferencesData.push_notifications,
          timezone: preferencesData.timezone
        }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUser = await userApi.updateProfile({
        first_name: profileForm.firstName,
        last_name: profileForm.lastName
      });

      if (updatedUser) {
        toast.success('Profile updated successfully');
        await refreshUserData();
      } else {
        toast.error(userApi.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const validation = userApi.validatePassword(passwordForm.newPassword);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsUpdating(true);
    try {
      const success = await userApi.updatePassword({
        password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      if (success) {
        toast.success('Password updated successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(userApi.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedPreferences = await userApi.updateUserPreferences({
        email_notifications: preferences.emailNotifications,
        marketing_emails: preferences.marketingEmails,
        push_notifications: preferences.pushNotifications,
        timezone: preferences.timezone
      });

      if (updatedPreferences) {
        toast.success('Preferences updated successfully');
      } else {
        toast.error(userApi.error || 'Failed to update preferences');
      }
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubscriptionUpgrade = async (planId: string) => {
    setIsUpdating(true);
    try {
      const updatedSubscription = await userApi.updateSubscription(planId);
      if (updatedSubscription) {
        toast.success('Subscription updated successfully');
        setSubscription(updatedSubscription);
      } else {
        toast.error(userApi.error || 'Failed to update subscription');
      }
    } catch (error) {
      toast.error('Failed to update subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state if user data is not available yet
  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Loading your account information...
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
      <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
      <p className="text-muted-foreground">
          Manage your account preferences and subscription
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input 
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input 
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={profileForm.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {user?.role && ROLES[user.role] ? ROLES[user.role].label : ROLES.guest.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Contact admin to change your role
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleProfileUpdate}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your books and campaigns
                  </p>
                </div>
                <Switch 
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing emails</p>
                  <p className="text-sm text-muted-foreground">
                    Tips and best practices for book publishing
                  </p>
                </div>
                <Switch 
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketingEmails: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about important events
                  </p>
                </div>
                <Switch 
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly reports</p>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance summaries
                  </p>
                </div>
                <Switch 
                  checked={preferences.weeklyReports}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>

              <Button 
                onClick={handlePreferencesUpdate}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <Input 
                  type="password" 
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input 
                  type="password" 
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input 
                  type="password" 
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={handlePasswordUpdate}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge 
                  variant={subscription?.status === 'active' ? 'default' : 'secondary'} 
                  className="mb-2"
                >
                  {subscription ? userApi.getSubscriptionLabel(subscription.plan) : 'Free Plan'}
                </Badge>
                <p className="text-2xl font-bold">
                  {subscription ? userApi.formatCurrency(SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan)?.price || 0) : '$0'}/month
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscription?.expires_at ? `Next billing date: ${userApi.formatDate(subscription.expires_at)}` : 'No active subscription'}
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Books uploaded</span>
                  <span>{userStats?.total_books || 0}/{userStats?.total_books || '∞'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Published books</span>
                  <span>{userStats?.published_books || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total revenue</span>
                  <span>{userApi.formatCurrency(userStats?.total_revenue || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account age</span>
                  <span>{userStats?.account_age_days || 0} days</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {subscription?.status !== 'active' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleSubscriptionUpgrade('pro')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Upgrading...
                      </>
                    ) : (
                      'Upgrade Plan'
                    )}
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="w-full">
                  View Billing History
                </Button>
                {subscription?.status === 'active' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => userApi.cancelSubscription()}
                    disabled={isUpdating}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Time Zone</label>
                <select 
                  className="w-full p-2 border rounded mt-1"
                  value={preferences.timezone}
                  onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                  <option value="UTC-6 (Central Time)">UTC-6 (Central Time)</option>
                  <option value="UTC-7 (Mountain Time)">UTC-7 (Mountain Time)</option>
                  <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Date Format</label>
                <select 
                  className="w-full p-2 border rounded mt-1"
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select 
                  className="w-full p-2 border rounded mt-1"
                  value={preferences.currency}
                  onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="CAD (C$)">CAD (C$)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Help Center
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Contact Support
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Feature Requests
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                API Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
