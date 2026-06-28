"use client"

import * as React from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToastVariant = "default" | "destructive"

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: ToastVariant
}

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "DISMISS_TOAST"; toastId: string }
  | { type: "REMOVE_TOAST"; toastId: string }

interface State {
  toasts: ToasterToast[]
}

let memoryState: State = { toasts: [] }
const listeners: ((state: State) => void)[] = []

function dispatch(action: Action) {
  switch (action.type) {
    case "ADD_TOAST":
      memoryState = { ...memoryState, toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT) }
      break
    case "DISMISS_TOAST":
      memoryState = { ...memoryState, toasts: memoryState.toasts.filter((t) => t.id !== action.toastId) }
      break
    case "REMOVE_TOAST":
      memoryState = { ...memoryState, toasts: memoryState.toasts.filter((t) => t.id !== action.toastId) }
      break
  }
  listeners.forEach((l) => l(memoryState))
}

function toast({ title, description, variant }: { title?: string; description?: string; variant?: ToastVariant }) {
  const id = crypto.randomUUID()
  dispatch({ type: "ADD_TOAST", toast: { id, title, description, variant } })
  setTimeout(() => dispatch({ type: "DISMISS_TOAST", toastId: id }), TOAST_REMOVE_DELAY)
  return id
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
