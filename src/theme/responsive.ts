import { useWindowDimensions } from 'react-native';
import { spacing } from './tokens';

/** Centered column so phones stay full-bleed and tablets don't stretch cards edge to edge. */
export const CONTENT_MAX_WIDTH = 840;
export const FORM_MAX_WIDTH = 480;

export function useResponsive() {
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 390;
  const tablet = width >= 600;
  return {
    width,
    compact,
    tablet,
    padding: compact ? 12 : tablet ? spacing.lg : spacing.md,
    planColumns: tablet ? 2 : 1,
    photoColumns: width >= 1000 ? 4 : tablet ? 3 : 2,
    showTabLabels: width >= 400 && fontScale < 1.25,
  };
}
