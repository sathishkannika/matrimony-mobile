import JailMonkey from 'jail-monkey';

/**
 * Root/jailbreak detection (docs/mobile-app-architecture-security.md §"Threat model" — "detection
 * itself should ship"). Phase 1 has no payments/photo-upload screens yet, so this only surfaces a
 * non-blocking warning (see DashboardScreen). When those screens land, they should call
 * isCompromisedDevice() themselves and hard-block per the documented product decision, rather than
 * this module deciding blocking policy for flows it doesn't know about.
 */
export function isCompromisedDevice(): boolean {
  try {
    return JailMonkey.isJailBroken();
  } catch {
    // Detection failing shouldn't itself lock legitimate users out.
    return false;
  }
}
