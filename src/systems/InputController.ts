import type { Keybind } from '../types/game'

type TriggerHandler = (timestamp: number) => void

export class InputController {
  private getKeybind: () => Keybind
  private onTrigger: TriggerHandler
  private pressedCodes = new Set<string>()
  private started = false

  constructor(getKeybind: () => Keybind, onTrigger: TriggerHandler) {
    this.getKeybind = getKeybind
    this.onTrigger = onTrigger
  }

  start() {
    if (this.started) {
      return
    }

    window.addEventListener('keydown', this.handleKeyDown, { capture: true })
    window.addEventListener('keyup', this.handleKeyUp, { capture: true })
    window.addEventListener('blur', this.handleBlur)
    this.started = true
  }

  stop() {
    window.removeEventListener('keydown', this.handleKeyDown, { capture: true })
    window.removeEventListener('keyup', this.handleKeyUp, { capture: true })
    window.removeEventListener('blur', this.handleBlur)
    this.pressedCodes.clear()
    this.started = false
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const keybind = this.getKeybind()

    if (event.code !== keybind.code || event.repeat || this.pressedCodes.has(event.code)) {
      return
    }

    event.preventDefault()
    this.pressedCodes.add(event.code)
    this.onTrigger(performance.now())
  }

  private handleKeyUp = (event: KeyboardEvent) => {
    this.pressedCodes.delete(event.code)
  }

  private handleBlur = () => {
    this.pressedCodes.clear()
  }
}
