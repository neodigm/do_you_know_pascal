/**
 * App Events - Central Event Hub
 *
 * Subscribes to all pub/sub topics and handles application-wide events.
 * Acts as the main event listener and coordinator.
 */

import PubSub from 'pubsub-js';
import AppBroadcast from './appBroadcast.js';
import { FEATURE_FLAGS } from '../../../../shared/featureFlags.js';

/**
 * Initialize application event listeners
 */
export function initAppEvents() {
  console.log('[AppEvents] Initializing event listeners...');

  // ============================================
  // Application Events
  // ============================================

  PubSub.subscribe(AppBroadcast.APP_READY, (msg, data) => {
    console.log('[AppEvents] APP_READY:', data);
  });

  PubSub.subscribe(AppBroadcast.APP_ERROR, (msg, data) => {
    console.error('[AppEvents] APP_ERROR:', data);
    // TODO: Show error toast/modal
  });

  PubSub.subscribe(AppBroadcast.APP_SIGNOUT, (msg, data) => {
    console.log('[AppEvents] APP_SIGNOUT:', data);
    // Handled by mvvLegit.doSignout()
  });

  // ============================================
  // Route Navigation Events
  // ============================================

  PubSub.subscribe(AppBroadcast.ROUTE_NAV_BEFORE, (msg, data) => {
    console.log('[AppEvents] ROUTE_NAV_BEFORE:', data);
    // Show loading indicator
    PubSub.publish(AppBroadcast.UI_LOADING_START);
  });

  PubSub.subscribe(AppBroadcast.ROUTE_NAV_AFTER, (msg, data) => {
    console.log('[AppEvents] ROUTE_NAV_AFTER:', data);
    // Hide loading indicator
    PubSub.publish(AppBroadcast.UI_LOADING_END);
  });

  PubSub.subscribe(AppBroadcast.ROUTE_NAV_ERROR, (msg, data) => {
    console.error('[AppEvents] ROUTE_NAV_ERROR:', data);
    PubSub.publish(AppBroadcast.APP_ERROR, {
      message: 'Navigation error',
      details: data
    });
  });

  // ============================================
  // Authentication Events
  // ============================================

  PubSub.subscribe(AppBroadcast.AUTH_SIGNIN_SUCCESS, (msg, data) => {
    console.log('[AppEvents] AUTH_SIGNIN_SUCCESS:', data);
    // mvvLegit will handle navigation to home route
  });

  PubSub.subscribe(AppBroadcast.AUTH_SIGNIN_FAIL, (msg, data) => {
    console.error('[AppEvents] AUTH_SIGNIN_FAIL:', data);
    PubSub.publish(AppBroadcast.UI_TOAST, {
      message: data.message || 'Sign in failed',
      type: 'danger'
    });
  });

  PubSub.subscribe(AppBroadcast.AUTH_SIGNUP_SUCCESS, (msg, data) => {
    console.log('[AppEvents] AUTH_SIGNUP_SUCCESS:', data);
    PubSub.publish(AppBroadcast.UI_TOAST, {
      message: 'Account created! Please check your email to verify.',
      type: 'success'
    });
    // Navigate to verification link prompt page
    PubSub.publish(AppBroadcast.AUTH_VERIFY_LINK);
  });

  PubSub.subscribe(AppBroadcast.AUTH_VERIFY_LINK, (msg, data) => {
    console.log('[AppEvents] AUTH_VERIFY_LINK: Navigating to verf-link route');
    if (window.router) {
      window.router.navigate('/verf-link');
    }
  });

  PubSub.subscribe(AppBroadcast.AUTH_SIGNUP_FAIL, (msg, data) => {
    console.error('[AppEvents] AUTH_SIGNUP_FAIL:', data);
    PubSub.publish(AppBroadcast.UI_TOAST, {
      message: data.message || 'Sign up failed',
      type: 'danger'
    });
  });

  PubSub.subscribe(AppBroadcast.AUTH_SIGNOUT_SUCCESS, (msg, data) => {
    console.log('[AppEvents] AUTH_SIGNOUT_SUCCESS:', data);
    PubSub.publish(AppBroadcast.UI_TOAST, {
      message: 'Signed out successfully',
      type: 'info'
    });
  });

  // REMOVED: This event handler was causing unwanted redirect to signin after successful signin
  // Navigation to signin is handled by AuthController when needed (e.g., token expiry)
  // PubSub.subscribe(AppBroadcast.AUTH_SIGNIN, (msg, data) => {
  //   console.log('[AppEvents] AUTH_SIGNIN: Navigating to signin route');
  //   if (window.router) {
  //     window.router.navigate('/signin');
  //   }
  // });

  PubSub.subscribe(AppBroadcast.AUTH_SIGNUP, (msg, data) => {
    console.log('[AppEvents] AUTH_SIGNUP: Navigating to signup route');
    if (window.router) {
      window.router.navigate('/signup');
    }
  });

  PubSub.subscribe(AppBroadcast.AUTH_FORGOT, (msg, data) => {
    console.log('[AppEvents] AUTH_FORGOT: Navigating to forgot route');
    if (window.router) {
      window.router.navigate('/forgot');
    }
  });

  PubSub.subscribe(AppBroadcast.AUTH_FORGOT_SUCCESS, (msg, data) => {
    console.log('[AppEvents] AUTH_FORGOT_SUCCESS:', data);
    PubSub.publish(AppBroadcast.UI_TOAST, {
      message: 'Password reset email sent!',
      type: 'success'
    });
  });

  PubSub.subscribe(AppBroadcast.AUTH_RESETHASH_NAV, (msg, data) => {
    console.log('[AppEvents] AUTH_RESETHASH_NAV: Navigating to resethash route');
    if (window.router) {
      window.router.navigate('/resethash');
    }
  });

  PubSub.subscribe(AppBroadcast.AUTH_RESETHASH_SUCCESS, (msg, data) => {
    console.log('[AppEvents] AUTH_RESETHASH_SUCCESS:', data);
    PubSub.publish(AppBroadcast.UI_TOAST, {
      message: 'Password reset successfully! Please sign in.',
      type: 'success'
    });
  });

  PubSub.subscribe(AppBroadcast.AUTH_TOKEN_EXPIRED, (msg, data) => {
    console.warn('[AppEvents] AUTH_TOKEN_EXPIRED:', data);
    PubSub.publish(AppBroadcast.UI_TOAST, {
      message: 'Session expired. Please sign in again.',
      type: 'warning'
    });
    // mvvLegit will handle automatic sign out and navigation
  });

  // ============================================
  // UI Events
  // ============================================

  PubSub.subscribe(AppBroadcast.UI_LOADING_START, (msg, data) => {
    // Show loading indicator
    const loader = document.getElementById('app-loader');
    if (loader) loader.classList.add('active');
  });

  PubSub.subscribe(AppBroadcast.UI_LOADING_END, (msg, data) => {
    // Hide loading indicator
    const loader = document.getElementById('app-loader');
    if (loader) loader.classList.remove('active');
  });

  PubSub.subscribe(AppBroadcast.UI_TOAST, (msg, data) => {
    // TODO: Implement toast notification system
    console.log('[AppEvents] UI_TOAST:', data);
  });

  PubSub.subscribe(AppBroadcast.UI_WELCOME_BACK_CLICKED, () => {
    console.log('[AppEvents] UI_WELCOME_BACK_CLICKED');
    const sMsg = '0.1'; // TODO: get this from meta
    const curYear = new Date().getFullYear();
    if (sMsg && typeof neodigmToast !== 'undefined') {
      neodigmToast.q(`${sMsg} __devops_ts__|© ${curYear} Mach Five Tech`, 'night');
    }
  });

  // ============================================
  // Web Component Events
  // ============================================

  PubSub.subscribe(AppBroadcast.WC_APP_PRIMARY_NAV_LOGO, (_msg, data) => {
    console.log('[AppEvents] WC_APP_PRIMARY_NAV_LOGO clicked:', data);
    const sMsg = '0.1'; // TODO: get this from meta
    const curYear = new Date().getFullYear();
    if (sMsg && typeof neodigmToast !== 'undefined') {
      neodigmToast.q(`${sMsg} __devops_ts__|© ${curYear} Mach Five Tech`, 'night', 5000);
    }
  });

  // ============================================
  // Cleanup Events
  // ============================================

  // Clear session_user from localStorage on signout
  PubSub.subscribe(AppBroadcast.AUTH_SIGNOUT, (msg, data) => {
    console.log('[AppEvents] AUTH_SIGNOUT: Clearing session_user from localStorage');
    localStorage.removeItem(FEATURE_FLAGS.FF_SSE_LS_SESSION_USER);
  });

  console.log('[AppEvents] Event listeners initialized');
}
