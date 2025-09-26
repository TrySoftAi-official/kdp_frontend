import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Niche } from '@/types';
import { nichesApi } from '@/utils/api';
import { formatCurrency } from '@/utils/utils';
import { RoleBased } from '@/components/shared/RoleBased';

export const Niches: React.FC = () => {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNiches();
  }, []);

  const fetchNiches = async () => {
    try {
      const response = await nichesApi.getNiches();
      if (response.success) {
        setNiches(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch niches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: Niche['trendDirection']) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCompetitionColor = (level: Niche['competitionLevel']) => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <RoleBased allowedRoles={['admin', 'assistant']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Niches</h1>
            <p className="text-muted-foreground">
              Explore and manage profitable book niches
            </p>
          </div>
          
          <RoleBased allowedRoles={['admin']}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Niche
            </Button>
          </RoleBased>
        </div>

        {/* Niches Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {niches.map((niche) => (
            <Card key={niche.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{niche.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {niche.category}
                    </p>
                  </div>
                  {getTrendIcon(niche.trendDirection)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Avg Revenue</p>
                    <p className="font-medium">{formatCurrency(niche.avgRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Books</p>
                    <p className="font-medium">{niche.bookCount}</p>
                  </div>
                </div>

                {/* Competition Level */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Competition</span>
                  <Badge variant={getCompetitionColor(niche.competitionLevel) as any}>
                    {niche.competitionLevel.charAt(0).toUpperCase() + niche.competitionLevel.slice(1)}
                  </Badge>
                </div>

                {/* Keywords */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Top Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {niche.keywords.slice(0, 4).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {niche.keywords.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{niche.keywords.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <RoleBased allowedRoles={['admin']}>
                    <Button size="sm" className="flex-1">
                      Edit
                    </Button>
                  </RoleBased>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {niches.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No niches found</h3>
                <p className="text-sm">Start by adding your first niche to track its performance.</p>
              </div>
              <RoleBased allowedRoles={['admin']}>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Niche
                </Button>
              </RoleBased>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleBased>
  );
};
