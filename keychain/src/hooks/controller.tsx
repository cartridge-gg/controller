import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useState,
} from "react";
import Controller from "src/utils/account";
import { KeyPair } from "starknet";
import { AccountId } from "caip";

export enum ControllerState {
    NONE,
    INIT,
    DEPLOYING,
    REGISTERING_DEVICE,
    READY,
}

interface ControllerInterface {
    controllerState: ControllerState;
    controller: Controller;
    create: (
        username: string,
        keypair: KeyPair,
        accountId: string,
        transaction: string,
    ) => Controller;
    register: (
        username: string,
        keypair: KeyPair,
        accountId: string,
        transaction: string,
    ) => void;
}

const ControllerContext = createContext<ControllerInterface>({} as ControllerInterface);

export function useController() {
    return useContext(ControllerContext);
}

export function ControllerProvider({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    const [controllerState, setControllerState] = useState<ControllerState>(
        ControllerState.INIT,
    );
    const [controller, setController] = useState<Controller>({} as Controller);

    useEffect(() => {
        Controller.fromStore().then(async (controller) => {
            if (!controller) {
                setControllerState(ControllerState.NONE);
                return;
            }

            setController(controller);
            const deployment = await controller.checkDeployment();
            setControllerState(deployment);

            // wait for tx to finalize
            if (
                (deployment === ControllerState.DEPLOYING ||
                    deployment === ControllerState.REGISTERING_DEVICE) &&
                controller.transaction
            ) {
                controller
                    .waitForTransaction(controller.transaction)
                    .then(() => {
                        setControllerState(ControllerState.READY);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        });
    }, []);

    const create = useCallback(
        (
            username: string,
            keypair: KeyPair,
            address: string,
            transaction: string,
        ) => {
            const controller = new Controller(
                username,
                keypair,
                address,
                transaction,
            );
            controller.cache();
            controller.approve(
                "https://cartridge.gg/",
                [
                    {
                        method: "incrementCounter",
                        target:
                            "0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1",
                    },
                ],
                "1000000000000000",
            );
            setController(controller);
            setControllerState(ControllerState.DEPLOYING);
            return controller;
        },
        [setController, setControllerState],
    );

    const register = useCallback(
        async (username: string, keypair: KeyPair, accountId: string, transaction: string) => {
            const account = AccountId.parse(accountId);
            const controller = new Controller(
                username,
                keypair,
                account.address,
                transaction,
            );
            controller.cache();
            setController(controller);
            setControllerState(ControllerState.READY);
            return controller;
        },
        [],
    );

    return (
        <ControllerContext.Provider
            value={{
                controllerState,
                controller,
                create,
                register,
            }}
        >{children}</ControllerContext.Provider>
    );
}
