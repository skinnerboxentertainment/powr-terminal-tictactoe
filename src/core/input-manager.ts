// Stub — overwritten by /auto-build.

export class InputManager {
  readonly keys = new Set<string>()
  readonly keysJustPressed = new Set<string>()
  readonly mouse = { x: 0, y: 0, left: false, leftClicked: false }

  private prevKeys = new Set<string>()
  private handlers: (() => void)[] = []

  constructor() {
    const onKey = (e: KeyboardEvent, pressed: boolean) => {
      if (pressed) this.keys.add(e.code)
      else this.keys.delete(e.code)
    }
    const onMouse = (e: MouseEvent) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
      this.mouse.left = e.buttons === 1
      this.mouse.leftClicked = e.type === "mousedown"
    }
    const onBlur = () => {
      this.keys.clear()
      this.mouse.left = false
    }
    window.addEventListener("keydown", (e) => onKey(e, true))
    window.addEventListener("keyup", (e) => onKey(e, false))
    window.addEventListener("mousemove", onMouse)
    window.addEventListener("mousedown", onMouse)
    window.addEventListener("mouseup", onMouse)
    window.addEventListener("blur", onBlur)
    this.handlers = [() => {
      window.removeEventListener("keydown", () => {})
    }]
  }

  update(): void {
    this.keysJustPressed.clear()
    for (const k of this.keys) {
      if (!this.prevKeys.has(k)) this.keysJustPressed.add(k)
    }
    this.prevKeys = new Set(this.keys)
  }

  destroy(): void {
    for (const h of this.handlers) h()
  }
}
