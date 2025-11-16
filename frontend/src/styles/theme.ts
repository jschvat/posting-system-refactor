/**
 * Theme configuration for styled-components
 */

/// <reference path="../styled-components.d.ts" />
import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    // Primary brand colors
    primary: '#1877f2',
    primaryDark: '#166fe5',
    primaryLight: 'rgba(24, 119, 242, 0.1)',

    // Secondary colors
    secondary: '#42b883',
    secondaryDark: '#38a169',
    accent: '#e74c3c',

    // Background colors
    background: '#f0f2f5',
    backgroundPrimary: '#ffffff',
    backgroundSecondary: '#f0f2f5',
    backgroundDisabled: '#f3f4f6',
    surface: '#ffffff',

    // Text colors
    text: {
      primary: '#1c1e21',      // Dark text (was #2c3e50 in some places)
      secondary: '#65676b',    // Medium gray text
      muted: '#8a8d91'         // Light gray text (was #8e8e93 in some places)
    },
    textLight: '#8a8d91',
    textSecondary: '#65676b',

    // Border colors
    border: '#e4e6ea',         // Standard border (consolidates #ecf0f1, #e0e0e0, #e5e5e5, #ccc)
    borderLight: '#f0f0f0',

    // Semantic colors - Error/Danger (consolidates #e74c3c, #f44336, #dc3545, #c0392b, #c82333)
    error: '#e74c3c',
    errorDark: '#c82333',
    errorLight: 'rgba(231, 76, 60, 0.1)',

    // Semantic colors - Success (consolidates #00d084, #27ae60, #28a745, #4CAF50)
    success: '#00d084',
    successDark: '#218838',
    successLight: 'rgba(0, 208, 132, 0.1)',

    // Semantic colors - Warning (consolidates #f39c12, #FF9800, #e67e22)
    warning: '#f39c12',
    warningLight: 'rgba(243, 156, 18, 0.1)',

    // Semantic colors - Info (consolidates #3498db, #2196F3, #2980b9)
    info: '#3498db',
    infoDark: '#2980b9',
    infoLight: 'rgba(52, 152, 219, 0.1)',

    // Interaction states
    hover: '#f7f8fa',

    // Messaging colors (iMessage-style)
    messageSent: '#007AFF',
    messageReceived: '#E5E5EA',
    messageTextOwn: '#ffffff',
    messageTextOther: '#000000',

    // Badge/Medal colors
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',

    // Status badge colors
    statusPending: '#856404',
    statusPendingBg: '#fff3cd',
    statusAccepted: '#27ae60',
    statusAcceptedBg: '#d5f4e6',
    statusRejected: '#c0392b',
    statusRejectedBg: '#ffe6e6',
    statusInfo: '#3498db',
    statusInfoBg: '#e7f3ff',

    // Group post status colors
    pinned: '#4CAF50',
    locked: '#FF9800',
    removed: '#F44336',

    // Reputation badge colors
    newcomer: '#95a5a6',
    member: '#3498db',
    contributor: '#9b59b6',
    veteran: '#e67e22',
    expert: '#e74c3c',
    legend: '#f39c12',

    // Vote colors
    upvote: '#FF6B35',
    downvote: '#4A90E2',

    // Utility colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    white: '#ffffff',
    black: '#000000'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.15)'
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px'
  }
};
