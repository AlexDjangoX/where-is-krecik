/** Only the panel root should handle arrow-key nudging (ignore bubbled child events). */
export function isFloatingPanelRootKeyboardTarget(
  target: EventTarget | null | undefined,
  currentTarget: EventTarget | null | undefined,
): boolean {
  return target != null && target === currentTarget;
}
