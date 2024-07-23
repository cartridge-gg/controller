use starknet::ContractAddress;

const SRC5_DELEGATE_ACCOUNT_INTERFACE_ID: felt252 =
    0x406350870d0cf6ca3332d174788fdcfa803e21633b124b746629775b9a294c;

#[starknet::interface]
trait IDelegateAccount<TContractState> {
    fn set_delegate_account(ref self: TContractState, delegate_address: ContractAddress);
    fn delegate_account(self: @TContractState) -> ContractAddress;
}
