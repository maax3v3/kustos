#!/bin/bash

# Function to pull and push an image with multiple tags
push_image() {
    local name=$1
    local tags=("${@:2}")
    
    for tag in "${tags[@]}"; do
        echo "Processing $name:$tag"
        docker pull $name:$tag
        docker tag $name:$tag localhost:5000/$name:$tag
        docker push localhost:5000/$name:$tag
    done
}

# Nginx
push_image "nginx" "1.23" "1.24" "1.25" "1.26" "1.27"

# Redis
push_image "redis"  "6.2" "7.2" "7.4"

# Postgres
push_image "postgres" "15.10" "16.6" "17.2"

echo "Registry has been populated with images"
