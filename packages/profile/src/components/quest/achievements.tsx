import {
  cn,
  BookIcon,
  DoveIcon,
} from "@cartridge/ui-next";
import { Achievement } from "./achievement";

export function Achievements() {
  
  return (
    <div className="flex flex-col gap-y-px">
      <div className="bg-secondary p-3 rounded-t-md">
        <p className="uppercase text-xs text-muted-foreground font-semibold tracking-wider">Progression</p>
      </div>
      <div className="bg-secondary p-2 flex gap-4">
        <div className="grow flex flex-col justify-center items-start bg-accent rounded-xl p-1">
          <div style={{ width: `${Math.floor(100 * 4 / 9)}%` }} className={cn("grow bg-primary rounded-xl", )} />
        </div>
        <p className="text-xs text-muted-foreground">
          4 of 9
        </p>
      </div>
      <Achievement Icon={BookIcon} title="rogue scholar" description="finish a run without killing any monsters" percentage={12} earning={50} timestamp={1729318800} />
      <Achievement Icon={DoveIcon} title="pacifist path" description="lorem ipsum dolor sit amet" percentage={24} earning={10} timestamp={1729328800} />
      <Achievement Icon={DoveIcon} title="pacifist path" description="lorem ipsum dolor sit amet" percentage={24} earning={10} timestamp={1729328800} />
      <Achievement Icon={DoveIcon} title="pacifist path" description="lorem ipsum dolor sit amet" percentage={24} earning={10} timestamp={1729328800} />
      <Achievement Icon={DoveIcon} title="pacifist path" description="lorem ipsum dolor sit amet" percentage={24} earning={10} timestamp={1729328800} />
      <Achievement Icon={DoveIcon} title="pacifist path" description="lorem ipsum dolor sit amet" percentage={24} earning={10} timestamp={1729328800} />
    </div>
  )
}
