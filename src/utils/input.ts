import type { Keybind } from '../types/game'

const namedKeys: Record<string, string> = {
  Space: 'Space',
  Enter: 'Enter',
  Escape: 'Esc',
  ShiftLeft: 'Left Shift',
  ShiftRight: 'Right Shift',
  ControlLeft: 'Left Ctrl',
  ControlRight: 'Right Ctrl',
  AltLeft: 'Left Alt',
  AltRight: 'Right Alt',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
}

export function keybindFromKeyboardEvent(event: KeyboardEvent): Keybind {
  const label = namedKeys[event.code] ?? event.key.toUpperCase()

  return {
    code: event.code,
    label,
  }
}
