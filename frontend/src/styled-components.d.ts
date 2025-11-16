import 'styled-components';
import React from 'react';

// Theme type definitions - Comprehensive color system
// Add JSX namespace for compatibility with react-icons
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
  }
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      // Primary brand colors
      primary: string;
      primaryDark: string;
      primaryLight: string;

      // Secondary colors
      secondary: string;
      secondaryDark: string;
      accent: string;

      // Background colors
      background: string;
      backgroundPrimary: string;
      backgroundSecondary: string;
      backgroundDisabled: string;
      surface: string;

      // Text colors
      text: {
        primary: string;
        secondary: string;
        muted: string;
      };
      textLight: string;
      textSecondary: string;

      // Border colors
      border: string;
      borderLight: string;

      // Semantic colors - Error
      error: string;
      errorDark: string;
      errorLight: string;

      // Semantic colors - Success
      success: string;
      successDark: string;
      successLight: string;

      // Semantic colors - Warning
      warning: string;
      warningLight: string;

      // Semantic colors - Info
      info: string;
      infoDark: string;
      infoLight: string;

      // Interaction states
      hover: string;

      // Messaging colors
      messageSent: string;
      messageReceived: string;
      messageTextOwn: string;
      messageTextOther: string;

      // Badge/Medal colors
      gold: string;
      silver: string;
      bronze: string;

      // Status badge colors
      statusPending: string;
      statusPendingBg: string;
      statusAccepted: string;
      statusAcceptedBg: string;
      statusRejected: string;
      statusRejectedBg: string;
      statusInfo: string;
      statusInfoBg: string;

      // Group post status colors
      pinned: string;
      locked: string;
      removed: string;

      // Reputation badge colors
      newcomer: string;
      member: string;
      contributor: string;
      veteran: string;
      expert: string;
      legend: string;

      // Vote colors
      upvote: string;
      downvote: string;

      // Utility colors
      overlay: string;
      overlayDark: string;
      overlayLight: string;
      white: string;
      black: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
    };
  }
}
