#!/bin/bash

# Script to copy face mesh detection files to another project
# Usage: ./copy-to-project.sh /path/to/your/other/project

if [ -z "$1" ]; then
    echo "Usage: ./copy-to-project.sh /path/to/your/other/project"
    echo "Example: ./copy-to-project.sh ~/Desktop/my-other-project"
    exit 1
fi

TARGET_DIR="$1"

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Target directory does not exist: $TARGET_DIR"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Copying face mesh detection files to: $TARGET_DIR"
echo ""

# Copy essential files
if [ -f "$SCRIPT_DIR/app.js" ]; then
    cp "$SCRIPT_DIR/app.js" "$TARGET_DIR/app.js"
    echo "✓ Copied app.js"
else
    echo "✗ app.js not found"
fi

if [ -f "$SCRIPT_DIR/style.css" ]; then
    cp "$SCRIPT_DIR/style.css" "$TARGET_DIR/style.css"
    echo "✓ Copied style.css"
else
    echo "✗ style.css not found"
fi

if [ -f "$SCRIPT_DIR/faceMeshModule.js" ]; then
    cp "$SCRIPT_DIR/faceMeshModule.js" "$TARGET_DIR/faceMeshModule.js"
    echo "✓ Copied faceMeshModule.js (module version)"
else
    echo "✗ faceMeshModule.js not found"
fi

echo ""
echo "Files copied successfully!"
echo ""
echo "Next steps:"
echo "1. Add MediaPipe scripts to your HTML (see IMPORT_TO_CURSOR.md)"
echo "2. Add HTML elements: <video id='video'>, <canvas id='output'>, buttons"
echo "3. Include app.js in your HTML after MediaPipe scripts"
echo "4. Test with a local server"


