import { useCallback, useMemo } from "react"
import { useAtom } from "jotai"
import type { SourceID } from "@shared/types"
import { focusSourcesAtom } from "~/atoms"

export function useFocus(id: SourceID) {
  const [focusSources, setFocusSources] = useAtom(focusSourcesAtom)
  const toggleFocus = useCallback(() => {
    setFocusSources(focusSources.includes(id) ? focusSources.filter(i => i !== id) : [...focusSources, id])
  }, [setFocusSources, focusSources, id])
  const isFocused = useMemo(() => focusSources.includes(id), [focusSources, id])

  return {
    toggleFocus,
    isFocused,
  }
}
