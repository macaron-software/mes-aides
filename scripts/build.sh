#!/bin/bash
# Build script for Mes Aides web assets
# Minifies CSS files for production

set -e

CSS_DIR="web/css"
DIST_DIR="web/dist"

echo "Building Mes Aides..."

# Create dist directory
mkdir -p "$DIST_DIR"

# Minify CSS (using simple sed - no npm required)
echo "Minifying CSS..."

minify_css() {
    # Remove comments, extra whitespace, newlines
    cat "$1" | \
        sed 's/\/\*[^*]*\*\+\([^\/][^*]*\*\+\)*\///g' | \
        tr -d '\n' | \
        sed 's/  */ /g' | \
        sed 's/ *{ */{/g' | \
        sed 's/ *} */}/g' | \
        sed 's/ *: */:/g' | \
        sed 's/ *; */;/g' | \
        sed 's/;}/}/g'
}

for css_file in "$CSS_DIR"/*.css; do
    filename=$(basename "$css_file")
    out_file="$DIST_DIR/${filename%.css}.min.css"
    minify_css "$css_file" > "$out_file"
    
    orig_size=$(wc -c < "$css_file" | tr -d ' ')
    min_size=$(wc -c < "$out_file" | tr -d ' ')
    savings=$((100 - (min_size * 100 / orig_size)))
    
    echo "  $filename: ${orig_size}B → ${min_size}B (-${savings}%)"
done

echo ""
echo "Build complete!"
