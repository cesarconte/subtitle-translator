#!/bin/bash

# Colores para mejor visualización
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Función para mostrar el banner de la aplicación
show_banner() {
  echo -e "${BLUE}${BOLD}"
  echo -e "  _____       _    _____ _____ _____           "
  echo -e " / ____|     | |  |_   _|  __ \\_   _|          "
  echo -e "| (___  _   _| |__  | | | |__) || | _ __ __ _ ___ "
  echo -e " \\___ \\| | | | '_ \\ | | |  ___/ | || '__/ _\` / __|"
  echo -e " ____) | |_| | |_) || |_| |    _| || | | (_| \\__ \\"
  echo -e "|_____/ \\__,_|_.__/_____|_|   |___||_|  \\__,_|___/"
  echo -e "                                                   "
  echo -e "${NC}${YELLOW}=== Herramienta de traducción de subtítulos ===${NC}"
  echo -e ""
}

# Función para verificar si MongoDB está instalado
check_mongodb_installed() {
  if ! command -v mongod &> /dev/null; then
    echo -e "${RED}✗ MongoDB no está instalado en este sistema${NC}"
    echo -e "Por favor, instala MongoDB antes de continuar:"
    if command -v pacman &> /dev/null; then
      echo -e "${YELLOW}sudo pacman -S mongodb-bin${NC}"
    elif command -v apt &> /dev/null; then
      echo -e "${YELLOW}sudo apt install mongodb${NC}"
    elif command -v dnf &> /dev/null; then
      echo -e "${YELLOW}sudo dnf install mongodb${NC}"
    else
      echo -e "Visita https://www.mongodb.com/docs/manual/installation/ para instrucciones"
    fi
    return 1
  fi
  return 0
}

# Función para verificar si MongoDB está en ejecución
check_mongodb_running() {
  if systemctl is-active --quiet mongodb; then
    echo -e "${GREEN}✓ MongoDB ya está en ejecución${NC}"
    return 0
  else
    return 1
  fi
}

# Función para iniciar MongoDB
start_mongodb() {
  echo -e "${YELLOW}⏳ Intentando iniciar MongoDB...${NC}"
  
  # Intentar iniciar sin sudo primero (por si el servicio no requiere permisos elevados)
  if systemctl start mongodb &>/dev/null; then
    echo -e "${GREEN}✓ MongoDB iniciado correctamente${NC}"
    return 0
  else
    # Si falla, intentar con sudo
    echo -e "${YELLOW}⚠️ Se requieren permisos de administrador para iniciar MongoDB${NC}"
    if sudo systemctl start mongodb; then
      echo -e "${GREEN}✓ MongoDB iniciado correctamente con sudo${NC}"
      return 0
    else
      echo -e "${RED}✗ Error al iniciar MongoDB${NC}"
      return 1
    fi
  fi
}

# Función principal
main() {
  show_banner
  
  # Verificar si MongoDB está instalado
  if ! check_mongodb_installed; then
    read -p "¿Desea continuar sin MongoDB? La aplicación podría fallar (s/N): " response
    if [[ ! "$response" =~ ^([sS]|[sS][iI])$ ]]; then
      echo -e "${RED}Ejecución cancelada${NC}"
      exit 1
    fi
  else
    # Verificar si MongoDB está en ejecución
    echo -e "Verificando estado de MongoDB..."
    if ! check_mongodb_running; then
      echo -e "${RED}✗ MongoDB no está activo${NC}"
      
      # Intentar iniciarlo
      if ! start_mongodb; then
        # Si no se puede iniciar, preguntar si continuar
        echo -e "${YELLOW}⚠️ MongoDB no pudo iniciarse. Esto puede causar problemas en la aplicación.${NC}"
        echo -e "Puedes iniciar MongoDB manualmente con: ${BOLD}sudo systemctl start mongodb${NC}"
        read -p "¿Desea continuar de todos modos? (s/N): " response
        if [[ ! "$response" =~ ^([sS]|[sS][iI])$ ]]; then
          echo -e "${RED}Ejecución cancelada${NC}"
          exit 1
        fi
      fi
    fi
  fi

  # Ejecutar la aplicación Spring Boot
  echo -e "${YELLOW}=== Iniciando SubTranslator ===${NC}"
  echo -e "${BLUE}Presiona Ctrl+C para detener la aplicación${NC}"
  echo -e ""
  ./mvnw spring-boot:run
}

# Ejecutar función principal
main
