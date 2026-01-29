import * as Dialog from "@radix-ui/react-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const TestDialog = () => {
  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-100 -translate-x-1/2 -translate-y-1/2 bg-white p-4">
          <ScrollArea className="w-full">
            <div className="flex gap-2 whitespace-nowrap min-w-max">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="w-32 h-20 bg-gray-200 shrink-0">
                  item {i}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
export default TestDialog