#[starknet::interface]
trait IResolver<TContractState> {
    fn resolve(
        self: @TContractState, domain: Span<felt252>, field: felt252, hint: Span<felt252>
    ) -> felt252;
}

