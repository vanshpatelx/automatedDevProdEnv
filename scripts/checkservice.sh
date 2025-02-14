#!/bin/bash

# ============================================================
# 🌟 Backend Health Check Script
# ============================================================

# 🎨 Define Colors for UI Formatting
GREEN=$(printf "\e[32m")
YELLOW=$(printf "\e[33m")
RED=$(printf "\e[31m")
CYAN=$(printf "\e[36m")
BOLD=$(printf "\e[1m")
RESET=$(printf "\e[0m")

# 🔹 Icons for better visualization
CHECK="✔️"
WARNING="⚠️"
ERROR="❌"
WAITING="⏳"
SUCCESS="🎉"
INFO="🔍"

# ============================================================
# 🏠 Navigate to Project Root
# ============================================================
cd "$(dirname "$0")/.." || { printf "${RED}${ERROR} Failed to change to project root. Please run from within the project.${RESET}\n"; exit 1; }

# 📂 Load Environment Variables
if [[ ! -f "variables.txt" ]]; then
    printf "${RED}${ERROR} variables.txt not found in the project root!${RESET}\n"
    exit 1
fi
source ./variables.txt

# 🕒 Configuration
MAX_WAIT_TIME=500
WAIT_TIME=0
WAIT_INTERVAL=5

# ============================================================
# 📌 Detect Backend Services
# ============================================================
SERVICES=($(ls -d backend/*/ 2>/dev/null | xargs -n 1 basename))

if [[ ${#SERVICES[@]} -eq 0 ]]; then
    printf "${RED}${ERROR} No backend services detected! Ensure you are in the correct directory.${RESET}\n"
    exit 1
fi

# 📝 Print the list of detected services
printf "\n${CYAN}${INFO} Checking health status of ${#SERVICES[@]} services...${RESET}\n\n"

# ============================================================
# 🚦 Service Health Check Loop
# ============================================================
while true; do
    ALL_READY=true

    for SERVICE in "${SERVICES[@]}"; do
        SERVICE_PORT_VAR="$(echo "${SERVICE}_PORT" | tr '[:lower:]' '[:upper:]')"  # Convert service name to uppercase
        SERVICE_PORT="${!SERVICE_PORT_VAR}"  # Get port value from environment variables

        if [[ -z "$SERVICE_PORT" ]]; then
            printf "${YELLOW}${WARNING} Port variable $SERVICE_PORT_VAR is not set in variables.txt. Skipping ${BOLD}$SERVICE${RESET}!\n"
            continue
        fi

        # Suppress curl errors and check service health
        if ! curl -sSf "http://localhost:$SERVICE_PORT/$SERVICE/health" > /dev/null 2>&1; then
            printf "${YELLOW}${WAITING} Waiting for ${BOLD}$SERVICE${RESET} on port ${BOLD}$SERVICE_PORT${RESET}...\n"
            ALL_READY=false
        else
            printf "${GREEN}${CHECK} ${BOLD}$SERVICE${RESET} is up on port ${BOLD}$SERVICE_PORT${RESET}!\n"
        fi
    done

    if $ALL_READY; then
        printf "\n${GREEN}${SUCCESS} All backend services are up and running!${RESET}\n"
        exit 0
    fi

    if [[ $WAIT_TIME -ge $MAX_WAIT_TIME ]]; then
        printf "\n${RED}${ERROR} Timed out waiting for backend services after ${MAX_WAIT_TIME} seconds!${RESET}\n"
        exit 1
    fi

    sleep $WAIT_INTERVAL
    WAIT_TIME=$((WAIT_TIME + WAIT_INTERVAL))
done
