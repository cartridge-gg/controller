use std::{
    io::{BufRead, BufReader},
    process::ChildStderr,
    process::ChildStdout,
    sync::mpsc::{self, Sender},
    thread,
    time::Duration,
};

pub struct OutputWaiter {
    child_stdout: ChildStdout,
    child_stderr: ChildStderr,
}

impl OutputWaiter {
    pub fn new(child_stdout: ChildStdout, child_stderr: ChildStderr) -> Self {
        Self {
            child_stdout,
            child_stderr,
        }
    }

    pub fn wait<F>(self, line_predicate: F)
    where
        F: Fn(&str) -> bool,
        F: Send + 'static,
    {
        let (sender, receiver) = mpsc::channel();
        let child_stdout = self.child_stdout;
        let child_stderr = self.child_stderr;

        thread::spawn(move || {
            OutputWaiter::wait_for_server_started_and_signal(
                child_stdout,
                sender.clone(), // Clone sender for stdout thread
                |l| line_predicate(l),
            );
        });

        // Spawn a separate thread for stderr
        thread::spawn(move || {
            let reader = BufReader::new(child_stderr);
            for line in reader.lines() {
                let line = line.expect("failed to read line from subprocess stderr");
                eprintln!("{}", line); // Log stderr to parent stderr
            }
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
            println!("{}", line); // Log stdout to parent stdout, add prefix

            if !is_send && line_predicate(&line) {
                sender.send(()).expect("failed to send start signal");
                is_send = true;
            }
        }
    }
}
