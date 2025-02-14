#!/bin/bash

# ============================================================
# 🌟 Backend Docker Image Build Script
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
BUILD="🛠️"
INFO="🔍"

# ============================================================
# 🏠 Navigate to Project Root
# ============================================================
cd "$(dirname "$0")/.." || { printf "${RED}${ERROR} Failed to change to project root. Please run from within the project.${RESET}\n"; exit 1; }

# ============================================================
# 📂 Ensure Script Runs from Project Root
# ============================================================
if [[ ! -d "backend" || ! -d "docker" ]]; then
    printf "${RED}${ERROR} Script must be run from the project root!${RESET}\n"
    exit 1
fi

# 🏷️ Set Version (default: latest if not provided)
VERSION=${1:-latest}

# ============================================================
# 📌 Detect Backend Services
# ============================================================
printf "\n${CYAN}${INFO} Detecting services in backend/...${RESET}\n"
SERVICES=($(ls -d backend/*/ 2>/dev/null | xargs -n 1 basename))

if [[ ${#SERVICES[@]} -eq 0 ]]; then
    printf "${RED}${ERROR} No services found in backend/${RESET}\n"
    exit 1
fi

printf "${GREEN}${CHECK} Found ${#SERVICES[@]} services:${RESET}\n"
for SERVICE in "${SERVICES[@]}"; do
    printf "   - ${BOLD}$SERVICE${RESET}\n"
done
printf "\n"

# ============================================================
# 🔄 Prepare for Building
# ============================================================
VARIABLES_FILE="variables.txt"

# 🛠️ Detect OS and set proper sed syntax
if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_CMD="sed -i ''"
else
    SED_CMD="sed -i"
fi

# ============================================================
# 🚀 Build Docker Images for Each Service
# ============================================================
for SERVICE in "${SERVICES[@]}"; do
    SERVICE_DOCKERFILE="docker/${SERVICE}/Dockerfile"

    # 🚧 Skip services without a Dockerfile
    if [[ ! -f "$SERVICE_DOCKERFILE" ]]; then
        printf "${YELLOW}${WARNING} No Dockerfile found for ${BOLD}$SERVICE${RESET} in ${BOLD}docker/${SERVICE}${RESET}, skipping.\n"
        continue
    fi

    IMAGE_NAME="${SERVICE}-service:${VERSION}"

    printf "${CYAN}${BUILD} Building image for ${BOLD}$SERVICE${RESET}...${RESET}\n"
    docker build -f "$SERVICE_DOCKERFILE" -t "$IMAGE_NAME" .

    if [[ $? -eq 0 ]]; then
        printf "${GREEN}${CHECK} Successfully built ${BOLD}$IMAGE_NAME${RESET}\n"

        # Convert service name to uppercase for ENV variable usage (e.g., auth -> AUTH_IMAGE)
        IMAGE_VAR="$(echo "${SERVICE}_IMAGE" | tr '[:lower:]' '[:upper:]')"

        # 🔄 Update variables.txt dynamically
        if [[ -f "$VARIABLES_FILE" ]]; then
            $SED_CMD "s|^${IMAGE_VAR}=.*|${IMAGE_VAR}=\"$IMAGE_NAME\"|" "$VARIABLES_FILE"
            printf "${GREEN}${CHECK} Updated ${BOLD}$IMAGE_VAR${RESET} in ${BOLD}$VARIABLES_FILE${RESET} to ${BOLD}$IMAGE_NAME${RESET}\n"
        else
            printf "${RED}${ERROR} ${VARIABLES_FILE} not found! Skipping update.${RESET}\n"
        fi
    else
        printf "${RED}${ERROR} Failed to build ${BOLD}$SERVICE${RESET}\n"
    fi
done

# ============================================================
# 🎉 Final Success Message
# ============================================================
printf "\n${GREEN}${CHECK} Done! All images built and updated in ${BOLD}$VARIABLES_FILE${RESET}.\n"
