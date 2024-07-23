const SRC5_INTERFACE_ID: felt252 = 0x3f918d17e5ee77373b56385708f855659a07f75997f365cf87748628532a055;
const SRC5_INTERFACE_ID_OLD: felt252 = 0x01ffc9a7;

#[starknet::interface]
trait ISRC5<TContractState> {
    fn supports_interface(self: @TContractState, interface_id: felt252) -> bool;
}

#[starknet::interface]
trait ISRC5Legacy<TContractState> {
    fn supportsInterface(self: @TContractState, interfaceId: felt252) -> felt252;
}
