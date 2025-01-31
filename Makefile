.PHONY: all install_deps start stop

all: install_deps start

install_deps:
	npm install

stop:
	@echo "Stopping any running instances on port 5000..."
	@sudo fuser -k 5000/tcp || true

start: stop
	@echo "Starting the server..."
	@npm start