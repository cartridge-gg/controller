use starknet::ContractAddress;

#[starknet::interface]
trait IDelegateAccount<TContractState> {
    fn set_delegate_account(ref self: TContractState, delegate_address: ContractAddress);
    fn delegate_account(self: @TContractState) -> ContractAddress;
}
