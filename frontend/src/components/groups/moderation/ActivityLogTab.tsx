import React, { useState, useEffect } from 'react';
import { useToast } from '../../Toast';
import groupsApi from '../../../services/groupsApi';
import { getErrorMessage } from './moderationUtils';
import {
  LoadingMessage,
  EmptyState,
  SectionTitle,
  ActivityList,
  ActivityItem,
  ActivityIcon,
  ActivityContent,
  ActivityAction,
  ActivityTarget,
  ActivityDetails,
  ActivityTimestamp
} from './ModerationStyles';

interface ActivityLogTabProps {
  slug: string;
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({ slug }) => {
  const { showError } = useToast();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadActivityLog();
  }, [slug]);

  const loadActivityLog = async () => {
    try {
      setLoading(true);
      const res = await groupsApi.getActivityLog(slug, { limit: 50 });
      if (res.success && res.data) {
        setActivities(res.data.activities);
        setTotal(res.data.total);
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: { [key: string]: string } = {
      'member_approved': 'Approved member',
      'member_rejected': 'Rejected member',
      'member_banned': 'Banned member',
      'member_unbanned': 'Unbanned member',
      'member_removed': 'Removed member',
      'role_changed': 'Changed role',
      'post_approved': 'Approved post',
      'post_removed': 'Removed post',
      'comment_removed': 'Removed comment'
    };
    return labels[action] || action;
  };

  if (loading) {
    return <LoadingMessage>Loading activity log...</LoadingMessage>;
  }

  if (activities.length === 0) {
    return <EmptyState>No moderation activity yet</EmptyState>;
  }

  return (
    <div>
      <SectionTitle>Recent Activity ({total} total actions)</SectionTitle>
      <ActivityList>
        {activities.map((activity, index) => (
          <ActivityItem key={index}>
            <ActivityIcon>📋</ActivityIcon>
            <ActivityContent>
              <ActivityAction>
                <strong>{activity.moderator_username}</strong> {getActionLabel(activity.action)}
              </ActivityAction>
              {activity.target_username && (
                <ActivityTarget>Target: @{activity.target_username}</ActivityTarget>
              )}
              {activity.details && (
                <ActivityDetails>{activity.details}</ActivityDetails>
              )}
              <ActivityTimestamp>
                {new Date(activity.created_at).toLocaleString()}
              </ActivityTimestamp>
            </ActivityContent>
          </ActivityItem>
        ))}
      </ActivityList>
    </div>
  );
};
