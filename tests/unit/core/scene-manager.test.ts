import { describe, it, expect, vi } from "vitest"
import { SceneManager } from "../../../src/core/scene-manager"
import type { Scene } from "../../../src/core/types"

function createMockScene(name: string): Scene {
  return {
    enter: vi.fn(),
    update: vi.fn(),
    exit: vi.fn(),
  }
}

describe("SceneManager", () => {
  it("test_scene_push_callsEnter", () => {
    const sm = new SceneManager({} as any)
    const scene = createMockScene("a")
    sm.push(scene)
    expect(scene.enter).toHaveBeenCalledTimes(1)
  })

  it("test_scene_pop_callsExit", () => {
    const sm = new SceneManager({} as any)
    const scene = createMockScene("a")
    sm.push(scene)
    sm.pop()
    expect(scene.exit).toHaveBeenCalledTimes(1)
  })

  it("test_scene_replace_swapsScenes", () => {
    const sm = new SceneManager({} as any)
    const a = createMockScene("a")
    const b = createMockScene("b")
    sm.push(a)
    sm.replace(b)
    expect(a.exit).toHaveBeenCalledTimes(1)
    expect(b.enter).toHaveBeenCalledTimes(1)
  })

  it("test_scene_update_callsCurrentScene", () => {
    const sm = new SceneManager({} as any)
    const a = createMockScene("a")
    const b = createMockScene("b")
    sm.push(a)
    sm.push(b)
    sm.update(1.0)
    expect(a.update).not.toHaveBeenCalled()
    expect(b.update).toHaveBeenCalledWith(1.0)
  })

  it("test_scene_push_twoScenesStack", () => {
    const sm = new SceneManager({} as any)
    const a = createMockScene("a")
    const b = createMockScene("b")
    sm.push(a)
    sm.push(b)
    sm.update(1.0)
    expect(a.update).not.toHaveBeenCalled()
    expect(b.update).toHaveBeenCalledWith(1.0)
  })
})
