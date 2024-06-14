const SRC5_INTERFACE_ID: felt252 =
    0x3f918d17e5ee77373b56385708f855659a07f75997f365cf87748628532a055;

#[starknet::interface]
trait ISRC5<TContractState> {
    fn supports_interface(self: @TContractState, interface_id: felt252) -> bool;
}

#[starknet::component]
mod src5_component {
    use controller::src5::{ISRC5, SRC5_INTERFACE_ID};
    use controller::outside_execution::interface::ERC165_OUTSIDE_EXECUTION_INTERFACE_ID_REV_1;

    #[storage]
    struct Storage {}

    #[embeddable_as(SRC5Impl)]
    impl SRC5<
        TContractState, +HasComponent<TContractState>
    > of ISRC5<ComponentState<TContractState>> {
        fn supports_interface(
            self: @ComponentState<TContractState>, interface_id: felt252
        ) -> bool {
            // TODO add other interfaces here
            if interface_id == SRC5_INTERFACE_ID {
                true
            } else if interface_id == ERC165_OUTSIDE_EXECUTION_INTERFACE_ID_REV_1 {
                true
            } else {
                false
            }
        }
    }
}
