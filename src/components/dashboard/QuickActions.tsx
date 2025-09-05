import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Megaphone, 
  FileText, 
  TestTube,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { UserRole } from '@/types';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  roles?: UserRole[];
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useUIStore();

  const handleUploadCSV = () => {
    navigate('/books?action=upload');
  };

  const handleCreateCampaign = () => {
    navigate('/ads?action=create');
  };

  const handleGenerateReport = () => {
    addNotification({
      title: 'Report Generated',
      message: 'Your analytics report has been generated and will be emailed shortly.',
      type: 'success'
    });
  };

  const handleSandboxMode = () => {
    addNotification({
      title: 'Sandbox Mode',
      message: 'Sandbox mode activated. All actions will be simulated.',
      type: 'info'
    });
  };

  const quickActions: QuickAction[] = [
    {
      label: 'Upload CSV',
      description: 'Import books from CSV file',
      icon: Upload,
      action: handleUploadCSV,
      roles: ['admin', 'assistant']
    },
    {
      label: 'Create Campaign',
      description: 'Launch new ad campaign',
      icon: Megaphone,
      action: handleCreateCampaign,
      variant: 'secondary',
      roles: ['admin', 'marketer']
    },
    {
      label: 'Generate Report',
      description: 'Create analytics report',
      icon: FileText,
      action: handleGenerateReport,
      variant: 'outline',
      roles: ['admin', 'marketer']
    },
    {
      label: 'Sandbox Mode',
      description: 'Test features safely',
      icon: TestTube,
      action: handleSandboxMode,
      variant: 'outline'
    }
  ];

  const { canAccess } = useAuth();

  const visibleActions = quickActions.filter(action => 
    !action.roles || canAccess(action.roles)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant || 'default'}
              onClick={action.action}
              className="h-auto flex-col items-start p-4 text-left"
            >
              <div className="flex items-center gap-2 w-full">
                <action.icon className="h-5 w-5" />
                <span className="font-medium">{action.label}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 font-normal">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
        
        {visibleActions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No actions available for your role</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
