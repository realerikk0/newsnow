import { Command } from "cmdk"
import { useMount } from "react-use"
import type { SourceID } from "@shared/types"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { sources } from "@shared/sources"
import clsx from "clsx"
import { typeSafeObjectEntries } from "@shared/type.util"
import pinyin from "@shared/pinyin.json"
import { OverlayScrollbar } from "../overlay-scrollbar"

import "./cmdk.css"
import { useSearchBar } from "~/hooks/useSearch"
import { CardWrapper } from "~/components/column/card"
import { useFocus } from "~/hooks/useFocus"

interface SourceItemProps {
  id: SourceID
  name: string
  title?: string
  pinyin: string
}

export function SearchBar() {
  const { opened, toggle } = useSearchBar()
  const sourceItems: SourceItemProps[] = useMemo(
    () =>
      typeSafeObjectEntries(sources).filter(([_, source]) => !source.redirect).map(([k, source]) => {
        return {
          id: k,
          title: source.title,
          column: source.column,
          name: source.name,
          pinyin: pinyin?.[k as keyof typeof pinyin],
        }
      }).sort((m, n) => m.pinyin > n.pinyin ? 1 : -1)
    , [],
  )
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef(null)

  useEffect(() => {
    document.body.classList.add("raycast")
    inputRef?.current?.focus()
  }, [])

  const down = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    , [toggle],
  )
  useMount(() => {
    document.addEventListener("keydown", down)
    return () => {
      document.removeEventListener("keydown", down)
    }
  })

  const [value, setValue] = useState(sourceItems[0].id)

  return (
    <Command.Dialog
      open={opened}
      onOpenChange={toggle}
      value={value}
      onValueChange={(v) => {
        if (v in sources) {
          setValue(v as SourceID)
        }
      }}
      className={clsx(
        "max-w-640px w-80vw rounded-xl shadow-2xl relative outline-none",
        "bg-base sprinkle-primary bg-op-97! backdrop-blur-5 pb-2 md:pb-12",
      )}
      disablePointerSelection
    >
      <div cmdk-raycast-top-shine="" />
      <Command.Input ref={inputRef} autoFocus placeholder="搜索你想要的" className="w-full px-4 pt-4 outline-none bg-transparent placeholder:color-neutral-500/60" />
      <hr cmdk-raycast-loader="" className="" />
      <div className="md:flex">
        <OverlayScrollbar defer={false} className="overflow-y-auto md:min-w-250px">
          <Command.List ref={listRef} className="px-3 flex flex-col gap-2 items-stretch h-400px!">
            <Command.Empty> 没有结果 </Command.Empty>
            <Command.Group heading="内容源">
              {sourceItems.map(k => (
                <SourceItem item={k} key={k.id} />
              ))}
            </Command.Group>
          </Command.List>
        </OverlayScrollbar>
        <div className="flex-1 p-4 min-w-350px max-md:hidden">
          <CardWrapper id={value} />
        </div>
      </div>
      <div cmdk-raycast-footer="" className="rounded-xl max-md:hidden!">
        <RaycastDarkIcon />
        <button cmdk-raycast-open-trigger="" type="button">
          Open Application
          <kbd>↵</kbd>
        </button>
      </div>
    </Command.Dialog>
  )
}

function SourceItem({ item }: {
  item: SourceItemProps
}) {
  const { isFocused, toggleFocus } = useFocus(item.id)
  return (
    <Command.Item
      keywords={[item.name, item.title ?? "", item.pinyin]}
      value={item.id}
      className="flex justify-between items-center p-2"
      onSelect={toggleFocus}
    >
      <span className="flex gap-2 items-center">
        <span
          className={clsx("w-4 h-4 rounded-md bg-cover")}
          style={{
            backgroundImage: `url(/icons/${item.id.split("-")[0]}.png)`,
          }}
        />
        <span>{item.name}</span>
        <span className="text-xs text-neutral-400/80 self-end mb-3px">{item.title}</span>
      </span>
      <span className={clsx(isFocused ? "i-ph-star-fill" : "i-ph-star-duotone", "bg-primary op-40")}></span>
    </Command.Item>
  )
}

function RaycastDarkIcon() {
  return (
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M301.144 634.799V722.856L90 511.712L134.244 467.804L301.144 634.799ZM389.201 722.856H301.144L512.288 934L556.34 889.996L389.201 722.856ZM889.996 555.956L934 511.904L512.096 90L468.092 134.052L634.799 300.952H534.026L417.657 184.679L373.605 228.683L446.065 301.144H395.631V628.561H723.048V577.934L795.509 650.395L839.561 606.391L723.048 489.878V389.105L889.996 555.956ZM323.17 278.926L279.166 322.978L326.385 370.198L370.39 326.145L323.17 278.926ZM697.855 653.61L653.994 697.615L701.214 744.834L745.218 700.782L697.855 653.61ZM228.731 373.413L184.679 417.465L301.144 533.93V445.826L228.731 373.413ZM578.174 722.856H490.07L606.535 839.321L650.587 795.269L578.174 722.856Z"
        fill="#FF6363"
      />
    </svg>
  )
}
