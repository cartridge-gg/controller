use std::{
    io::{BufRead, BufReader},
    process::ChildStdout,
    sync::mpsc::{self, Sender},
    thread,
    time::Duration,
};

pub struct OutputWaiter {
    child_stdout: ChildStdout,
}

impl OutputWaiter {
    pub fn new(child_stdout: ChildStdout) -> Self {
        Self { child_stdout }
    }

    pub fn wait<F>(self, line_predicate: F)
    where
        F: Fn(&str) -> bool,
        F: Send + 'static,
    {
        let (sender, receiver) = mpsc::channel();
        let child_stdout = self.child_stdout;

        thread::spawn(move || {
            OutputWaiter::wait_for_server_started_and_signal(child_stdout, sender, |l| {
                line_predicate(l)
            });
        });

        receiver
            .recv_timeout(Duration::from_secs(5))
            .expect("timeout waiting for subprocess");
    }

    fn wait_for_server_started_and_signal(
        stdout: ChildStdout,
        sender: Sender<()>,
        line_predicate: impl Fn(&str) -> bool,
    ) {
        let reader = BufReader::new(stdout);

        let mut is_send = false;
        for line in reader.lines() {
            let line = line.expect("failed to read line from subprocess stdout");
            println!("{}", line); // Log to parent stdout

            if !is_send && line_predicate(&line) {
                sender.send(()).expect("failed to send start signal");
                is_send = true;
            }
        }
    }
}
