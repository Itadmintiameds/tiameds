"use client";

import { useIdleLogout } from '@/hooks/useIdleLogout';

/**
 * Global component to handle idle logout across the entire app
 * This component should be placed at the root level of your app
 * 
 * Automatically logs out users after 30 minutes of inactivity.
 * Monitors: mouse movement, keyboard input, clicks, scroll, and touch events.
 */
const IdleLogoutHandler = () => {
  // Enable idle logout with 30-minute timeout
  useIdleLogout(30, true);

  // This component doesn't render anything
  return null;
};

export default IdleLogoutHandler;

