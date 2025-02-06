#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator.
#[cfg(not(feature = "wee_alloc"))]
#[global_allocator]
static ALLOC: std::alloc::System = std::alloc::System;
