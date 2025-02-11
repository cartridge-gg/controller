FROM mcr.microsoft.com/playwright:v1.50.1

# Set environment variables
ENV CI=true \
    TZ=UTC \
    DISPLAY=:99

# Install additional dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    build-essential \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Rust and wasm-pack
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    . $HOME/.cargo/env && \
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Add cargo to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

RUN npm i -g pnpm

# Setup display with consistent resolution
RUN Xvfb :99 -screen 0 1280x1024x24 2>/dev/null & 

WORKDIR /app

# Copy package files for installation
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Default command that can be overridden
CMD ["bash"]
