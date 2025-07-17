import { LayoutContent, BoltIcon, CircleIcon } from "@cartridge/ui";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useConnection } from "@/hooks/connection";
import { useUpgrade } from "../provider/upgrade";

export const Upgrade = () => {
  const { controller } = useConnection();
  const upgrade = useUpgrade();

  return (
    <ExecutionContainer
      icon={<BoltIcon variant="solid" size="lg" />}
      title={"Upgrade " + controller?.username()}
      description={""}
      transactions={upgrade.calls}
      buttonText="Upgrade"
      onSubmit={upgrade.onUpgrade}
      executionError={upgrade.error}
    >
      <LayoutContent>
        <div className="text-sm text-foreground-400 pb-2">
          Update to the latest Controller to continue
        </div>
        <div className="flex flex-col rounded p-4 border border-l-8 border-background-300 bg-background-200 gap-1">
          <div className="text-sm text-foreground-400 font-bold">
            Upgrade Details
          </div>
          <div className="flex flex-col">
            {upgrade.latest?.changes.map((item, i) => (
              <div key={i} className="flex items-center text-sm gap-1">
                <CircleIcon size="xs" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </LayoutContent>
    </ExecutionContainer>
  );
};
