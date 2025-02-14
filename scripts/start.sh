#!/bin/bash

# ============================================================
# 🌟 Backend Environment (Variables) Setup Script
# ============================================================

# 🎨 Define Colors for UI Formatting
GREEN=$(printf "\e[32m")
YELLOW=$(printf "\e[33m")
RED=$(printf "\e[31m")
BLUE=$(printf "\e[34m")
CYAN=$(printf "\e[36m")
BOLD=$(printf "\e[1m")
RESET=$(printf "\e[0m")

# 🔹 Icons for better visualization
CHECK="✔️"
WARNING="⚠️"
ERROR="❌"
INFO="🔍"
RESETTING="📋"
CLEARING="🗑️"

# ============================================================
# 📂 Define Paths
# ============================================================
VARIABLES_FILE="../variables.txt"
BACKEND_DIR="../backend"
DOCKER_DIR="../docker"

DOCKER_COMPOSE_FILES=(
    "docker-compose.yaml"
    "docker-compose.resources.yaml"
)

# ============================================================
# 📌 Detect Backend Services
# ============================================================
printf "\n${CYAN}${INFO} Detecting services in ${BACKEND_DIR}...${RESET}\n"
SERVICES=($(ls -d ${BACKEND_DIR}/*/ 2>/dev/null | xargs -n 1 basename))

if [[ ${#SERVICES[@]} -eq 0 ]]; then
    printf "${RED}${ERROR} No services found in ${BACKEND_DIR}/${RESET}\n"
    exit 1
fi

printf "${GREEN}${CHECK} Found ${#SERVICES[@]} services:${RESET}\n"
for SERVICE in "${SERVICES[@]}"; do
    printf "   - ${BOLD}$SERVICE${RESET}\n"
done
printf "\n"

# ============================================================
# 🔄 Processing Services
# ============================================================
for SERVICE in "${SERVICES[@]}"; do
    ENV_FILE="${BACKEND_DIR}/${SERVICE}/.env"
    SERVICE_UPPER=$(echo "$SERVICE" | tr '[:lower:]' '[:upper:]')

    # 🚧 Check if variables exist for this service
    if ! grep -q "^${SERVICE_UPPER}_" "$VARIABLES_FILE"; then
        printf "${YELLOW}${WARNING} Skipping ${BOLD}$SERVICE${RESET}, no matching variables found in ${VARIABLES_FILE}.${RESET}\n"
        continue
    fi

    # 🔄 Reset .env file
    printf "${BLUE}${CLEARING} Clearing ${ENV_FILE}...${RESET}\n"
    > "$ENV_FILE"

    printf "${GREEN}${CHECK} Generating ${ENV_FILE} from ${VARIABLES_FILE}...${RESET}\n"
    while IFS='=' read -r key value; do
        if [[ -n "$key" && "$key" != "#"* && "$key" == "${SERVICE_UPPER}_"* ]]; then
            new_key=${key#${SERVICE_UPPER}_}
            echo "${new_key}=${value}" >> "$ENV_FILE"
        fi
    done < "$VARIABLES_FILE"

    # ============================================================
    # 🔄 Reset and Update Docker Compose Files
    # ============================================================
    for COMPOSE_FILE in "${DOCKER_COMPOSE_FILES[@]}"; do
        EXAMPLE_FILE="${DOCKER_DIR}/${SERVICE}/example.${COMPOSE_FILE}"
        TARGET_FILE="${DOCKER_DIR}/${SERVICE}/${COMPOSE_FILE}"

        if [[ -f "$EXAMPLE_FILE" ]]; then
            printf "${BLUE}${RESETTING} Resetting ${TARGET_FILE} from ${EXAMPLE_FILE}...${RESET}\n"
            cp "$EXAMPLE_FILE" "$TARGET_FILE"
        else
            printf "${YELLOW}${WARNING} No example file found for ${COMPOSE_FILE}, skipping reset.${RESET}\n"
            continue
        fi

        # 🔄 Replace Variables in Docker Compose File
        while IFS='=' read -r key value; do
            if [[ -n "$key" && "$key" != "#"* && "$key" == "${SERVICE_UPPER}_"* ]]; then
                var_name=${key#${SERVICE_UPPER}_}  
                key_placeholder="\${$var_name}"
                quoted_placeholder="\"\${$var_name}\""

                # Escape special characters for `sed`
                escaped_value=$(printf '%s\n' "$value" | sed 's/[\/&]/\\&/g')

                # echo "Replacing: ${key_placeholder} -> ${escaped_value}"
                # echo "Replacing: ${quoted_placeholder} -> \"${escaped_value}\""

                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # First replace ${VAR} → value
                    sed -i "" "s#${key_placeholder}#${escaped_value}#g" "$TARGET_FILE"
                    # Then replace "${VAR}" → "value"
                    sed -i "" "s#${quoted_placeholder}#\"${escaped_value}\"#g" "$TARGET_FILE"
                else
                    # First replace ${VAR} → value
                    sed -i "s#${key_placeholder}#${escaped_value}#g" "$TARGET_FILE"
                    # Then replace "${VAR}" → "value"
                    sed -i "s#${quoted_placeholder}#\"${escaped_value}\"#g" "$TARGET_FILE"
                fi
            fi
        done < "$VARIABLES_FILE"


        printf "${GREEN}${CHECK} Updated ${TARGET_FILE} with environment variables.${RESET}\n"
    done
done

# ============================================================
# 🎉 Final Success Message for seprate docker files
# ============================================================
printf "\n${GREEN}${CHECK} Done! Environment files and Docker configurations are set up for separate servers.${RESET}\n"


DOCKER_COMPOSE_FILES=(
    "docker-compose.yaml"
    "docker-compose.resources.yaml"
)

EXAMPLE_COMPOSE_FILES=(
    "example.docker-compose.yaml"
    "example.docker-compose.resources.yaml"
)

# ============================================================
# 🔄 Copy and Update Docker Compose Files - Whole system Docker files
# ============================================================
printf "\n${CYAN}${INFO} Copying and updating Docker Compose files in ${DOCKER_DIR}...${RESET}\n"

for ((i=0; i<${#EXAMPLE_COMPOSE_FILES[@]}; i++)); do
    EXAMPLE_FILE="${DOCKER_DIR}/${EXAMPLE_COMPOSE_FILES[$i]}"
    TARGET_FILE="${DOCKER_DIR}/${DOCKER_COMPOSE_FILES[$i]}"

    if [[ -f "$EXAMPLE_FILE" ]]; then
        printf "${BLUE}${RESETTING} Copying ${EXAMPLE_FILE} to ${TARGET_FILE}...${RESET}\n"
        cp "$EXAMPLE_FILE" "$TARGET_FILE"
    else
        printf "${YELLOW}${WARNING} No example file found: ${EXAMPLE_FILE}, skipping.${RESET}\n"
        continue
    fi

    while IFS='=' read -r key value; do
        if [[ -n "$key" && "$key" != "#"* ]]; then
            var_name="${key}"
            key_placeholder="\${$var_name}"
            quoted_placeholder="\"\${$var_name}\""

            # Escape special characters for `sed`
            escaped_value=$(printf '%s\n' "$value" | sed 's/[\/&]/\\&/g')

            # echo "Replacing: ${key_placeholder} -> ${escaped_value}"
            # echo "Replacing: ${quoted_placeholder} -> \"${escaped_value}\""

            if [[ "$OSTYPE" == "darwin"* ]]; then
                # First replace ${VAR} → value
                sed -i "" "s#${key_placeholder}#${escaped_value}#g" "$TARGET_FILE"
                # Then replace "${VAR}" → "value"
                sed -i "" "s#${quoted_placeholder}#\"${escaped_value}\"#g" "$TARGET_FILE"
            else
                # First replace ${VAR} → value
                sed -i "s#${key_placeholder}#${escaped_value}#g" "$TARGET_FILE"
                # Then replace "${VAR}" → "value"
                sed -i "s#${quoted_placeholder}#\"${escaped_value}\"#g" "$TARGET_FILE"
            fi
        fi
    done < "$VARIABLES_FILE"


    printf "${GREEN}${CHECK} Updated ${TARGET_FILE} with environment variables.${RESET}\n"
done

# ============================================================
# 🎉 Final Success Message
# ============================================================
printf "\n${GREEN}${CHECK} Done! Environment files and Docker configurations are set up.${RESET}\n"
