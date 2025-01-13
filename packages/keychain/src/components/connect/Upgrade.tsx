import { BoltIcon, CircleIcon } from "@cartridge/ui-next";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { Content } from "@/components/layout";
import { useConnection } from "@/hooks/connection";

export const Upgrade = () => {
  const { upgrade, controller } = useConnection();

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
      <Content>
        <div className="text-sm text-muted-foreground pb-2">
          Install the latest to continue
        </div>
        <div className="flex flex-col rounded p-4 border border-l-8 border-background-200 bg-background-100 gap-1">
          <div className="text-sm text-muted-foreground font-bold">
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
      </Content>
    </ExecutionContainer>
  );
};
