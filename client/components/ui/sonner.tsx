import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900/90 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-white group-[.toaster]:border-slate-800 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-3",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-orange-500 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
