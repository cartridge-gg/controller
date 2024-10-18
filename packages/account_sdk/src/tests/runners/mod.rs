use std::net::TcpListener;

pub mod cartridge;
pub mod katana;

pub fn find_free_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .unwrap()
        .local_addr()
        .unwrap()
        .port()
}
