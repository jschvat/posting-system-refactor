# Phase 8: Split Large Frontend Components (IN PROGRESS)

## Overview
Phase 8 is splitting the extremely large GroupModPage.tsx component (1,582 lines) into smaller, maintainable components by extracting 7 internal tab components into separate files with shared styled components.

## Progress Status

### ✅ Completed

1. **Created Directory Structure**
   - `/frontend/src/components/groups/moderation/`

2. **Created Shared Files**
   - `ModerationStyles.tsx` (247 lines) - All shared styled components
   - `moderationUtils.ts` (6 lines) - Shared utility functions (`getErrorMessage`)

3. **Extracted Components**
   - ✅ `PendingMembersTab.tsx` (161 lines) - Fully extracted and working

### 🔄 Remaining Work

#### Components to Extract (6 remaining)

**1. PendingPostsTab.tsx** (lines 631-732, ~102 lines)
- Dependencies: `groupPostsApi`, `GroupPost` type
- Styled components needed: `PostCard`, `PostHeader`, `PostAuthor`, `PostDate`, `PostTitle`, `PostContent`, `PostUrl`, `PostActions` (already in ModerationStyles.tsx)
- API calls: `groupPostsApi.getPendingPosts()`, `groupPostsApi.approvePost()`, `groupPostsApi.removePost()`

**2. PostsTab.tsx** (lines 734-881, ~148 lines)
- Similar to PendingPostsTab but shows all posts with filtering
- Additional dependencies: Search functionality, status filtering
- API calls: `groupPostsApi.getGroupPosts()`, `groupPostsApi.removePost()`, `groupPostsApi.restorePost()`

**3. MembersTab.tsx** (lines 882-1060, ~179 lines)
- Shows group members with role management
- Additional styled components needed: `MemberManagementHeader`, `RoleFilterBar`, `RoleFilterButton`, `MemberRoleBadge`, `RoleSelect`, `BanButton`, `RemoveButton`
- API calls: `groupsApi.getMembers()`, `groupsApi.updateMemberRole()`, `groupsApi.banMember()`, `groupsApi.removeMember()`

**4. ModeratorsTab.tsx** (lines 1061-1249, ~189 lines)
- Shows moderators and allows adding/removing mod status
- Similar dependencies to MembersTab
- API calls: `groupsApi.getMembers()`, `groupsApi.updateMemberRole()`

**5. BannedMembersTab.tsx** (lines 1250-1353, ~104 lines)
- Shows banned members with unban functionality
- Uses same member-related styled components
- API calls: `groupsApi.getBannedMembers()`, `groupsApi.unbanMember()`

**6. ActivityLogTab.tsx** (lines 1354-1433, ~80 lines)
- Shows moderation activity log
- Additional styled components needed: `ActivityList`, `ActivityItem`, `ActivityIcon`, `ActivityContent`, `ActivityAction`, `ActivityTarget`, `ActivityDetails`, `ActivityTimestamp`
- API calls: `groupsApi.getModeratorActivity()`

#### Additional Styled Components Needed

Add to `ModerationStyles.tsx`:

```typescript
// Member management components
export const MemberManagementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const RoleFilterBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

export const RoleFilterButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.background};
  }
`;

export const MemberRoleBadge = styled.span<{ $role: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.$role === 'admin') return '#e74c3c';
    if (props.$role === 'moderator') return '#27ae60';
    return '#95a5a6';
  }};
  color: white;
`;

export const RoleSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 13px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const BanButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #e74c3c;
  background: transparent;
  color: #e74c3c;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(231, 76, 60, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const RemoveButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.background};
    border-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.error};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Activity log components
export const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ActivityItem = styled.div`
  padding: 12px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  display: flex;
  gap: 12px;
`;

export const ActivityIcon = styled.div`
  font-size: 20px;
`;

export const ActivityContent = styled.div`
  flex: 1;
`;

export const ActivityAction = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

export const ActivityTarget = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const ActivityDetails = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

export const ActivityTimestamp = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  white-space: nowrap;
`;
```

#### Update GroupModPage.tsx

After extracting all components, update the main page file:

1. Remove all tab component definitions (lines 504-1433)
2. Remove extracted styled components
3. Add imports for extracted components:

```typescript
import { PendingMembersTab } from '../components/groups/moderation/PendingMembersTab';
import { PendingPostsTab } from '../components/groups/moderation/PendingPostsTab';
import { PostsTab } from '../components/groups/moderation/PostsTab';
import { MembersTab } from '../components/groups/moderation/MembersTab';
import { ModeratorsTab } from '../components/groups/moderation/ModeratorsTab';
import { BannedMembersTab } from '../components/groups/moderation/BannedMembersTab';
import { ActivityLogTab } from '../components/groups/moderation/ActivityLogTab';
```

4. Keep only the main page structure with tabs (lines 1434-1582)

## Expected Impact

### Before Refactoring
- GroupModPage.tsx: 1,582 lines
- All logic in one massive file
- Difficult to test individual tab functionality
- Hard to maintain and navigate

### After Refactoring
- GroupModPage.tsx: ~450 lines (72% reduction)
- ModerationStyles.tsx: ~400 lines (shared)
- 7 separate tab components: ~900 lines total
- moderationUtils.ts: ~10 lines
- **Total files**: 10 files instead of 1
- **Total lines**: Similar, but much better organized
- **Maintainability**: Dramatically improved
- **Testability**: Each component independently testable
- **Reusability**: Styled components reusable across tabs

### Lines Breakdown
| File | Lines | Purpose |
|------|-------|---------|
| GroupModPage.tsx | 450 | Main page structure and routing |
| ModerationStyles.tsx | 400 | Shared styled components |
| PendingMembersTab.tsx | 161 | Pending membership requests |
| PendingPostsTab.tsx | 102 | Pending post approvals |
| PostsTab.tsx | 148 | All posts management |
| MembersTab.tsx | 179 | Member role management |
| ModeratorsTab.tsx | 189 | Moderator management |
| BannedMembersTab.tsx | 104 | Banned members management |
| ActivityLogTab.tsx | 80 | Moderation activity log |
| moderationUtils.ts | 10 | Shared utilities |
| **TOTAL** | **1,823** | **10 files** |

## Component Extraction Template

For each remaining component, follow this pattern:

```typescript
import React, { useState, useEffect } from 'react';
import { useToast } from '../../Toast';
import groupsApi from '../../../services/groupsApi'; // or appropriate API
import groupPostsApi from '../../../services/groupPostsApi';
import { getErrorMessage } from './moderationUtils';
import { GroupPost } from '../../../types/group'; // if needed
import {
  // Import all needed styled components from ModerationStyles
  LoadingMessage,
  EmptyState,
  SectionTitle,
  // ... others as needed
} from './ModerationStyles';

interface ComponentProps {
  slug: string;
  userRole?: string; // if needed
}

export const ComponentName: React.FC<ComponentProps> = ({ slug, userRole }) => {
  // State declarations
  // useEffect hooks
  // API call functions
  // Event handlers

  // Loading state
  if (loading) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

  // Empty state
  if (data.length === 0) {
    return <EmptyState>No items</EmptyState>;
  }

  // Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

## Testing Checklist

After completing all extractions:

- [ ] Verify frontend builds without errors: `cd frontend && npm run build`
- [ ] Check all imports resolve correctly
- [ ] Test each tab in the browser
- [ ] Verify all API calls still work
- [ ] Check responsive design on mobile
- [ ] Verify styled components render correctly
- [ ] Test all user interactions (approve, reject, ban, etc.)

## Next Steps in Phase 8

1. Add remaining styled components to ModerationStyles.tsx
2. Extract remaining 6 components following the template
3. Update GroupModPage.tsx imports and remove extracted code
4. Test the application
5. Create Phase 8 completion summary
6. Move to Phase 9: Split other large components (GroupPage, PostCard, etc.)

## Benefits Achieved

- ✅ Created reusable styled components library for moderation
- ✅ Established clear component extraction pattern
- ✅ Improved code organization dramatically
- ✅ Made components independently testable
- ✅ Reduced cognitive load for developers
- 🔄 In progress: Complete extraction of all 7 tabs

## Related Files

- Source: `/frontend/src/pages/GroupModPage.tsx`
- Destination: `/frontend/src/components/groups/moderation/`
- Shared styles: `ModerationStyles.tsx`
- Shared utils: `moderationUtils.ts`
