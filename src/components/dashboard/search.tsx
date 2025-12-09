import { Input } from "@/components/ui/input"

export function Search() {
  return (
    <div>
      <Input
        className="md:w-[100px] lg:w-[300px]"
        placeholder="Search..."
        type="search"
      />
    </div>
  )
}