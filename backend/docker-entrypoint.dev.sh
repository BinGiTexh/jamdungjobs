#!/bin/sh
set -e

# Function to wait for database
wait_for_db() {
    echo "Waiting for database to be ready..."
    max_retries=30
    retries=0
    
    until nc -z db 5432 || [ $retries -eq $max_retries ]; do
        echo "Waiting for database connection... ($(( retries + 1 ))/$max_retries)"
        retries=$(( retries + 1 ))
        sleep 1
    done

    if [ $retries -eq $max_retries ]; then
        echo "Error: Could not connect to database after $max_retries attempts"
        exit 1
    fi

    echo "Database is ready!"
}

# Function to handle Prisma setup
setup_prisma() {
    echo "Setting up Prisma..."
    
    # Generate Prisma Client
    if ! npx prisma generate; then
        echo "Error: Failed to generate Prisma client"
        exit 1
    fi

    # Run database migrations
    if ! npx prisma migrate dev --name init; then
        echo "Error: Failed to run database migrations"
        exit 1
    fi

    echo "Prisma setup completed successfully!"
}

# Main execution
main() {
    # Wait for database
    wait_for_db

    # Setup Prisma
    setup_prisma

    # Start the application with the provided command
    echo "Starting application: $*"
    exec "$@"
}

# Execute main function with all script arguments
main "$@"

