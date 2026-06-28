import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { InputManager } from "../../../src/core/input-manager"

describe("InputManager", () => {
  let input: InputManager

  beforeEach(() => {
    input = new InputManager()
  })

  afterEach(() => {
    input.destroy()
  })

  it("test_input_keys_emptyInitially", () => {
    expect(input.keys.size).toBe(0)
  })

  it("test_input_keysJustPressed_emptyAfterUpdate", () => {
    input.update()
    expect(input.keysJustPressed.size).toBe(0)
  })

  it("test_input_mouse_hasDefaults", () => {
    expect(input.mouse.left).toBe(false)
    expect(typeof input.mouse.x).toBe("number")
    expect(typeof input.mouse.y).toBe("number")
  })

  it("test_input_update_preservesLeftClicked", () => {
    input.mouse.leftClicked = true
    input.update()
    expect(input.mouse.leftClicked).toBe(true)
  })

  it("test_input_blur_clearsKeys", () => {
    input.keys.add("Space")
    window.dispatchEvent(new Event("blur"))
    expect(input.keys.size).toBe(0)
  })
})
