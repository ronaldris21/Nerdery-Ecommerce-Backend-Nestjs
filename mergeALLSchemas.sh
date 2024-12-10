#!/bin/bash

# Define the input folder and output file
input_folder="graphql-typeDefinitions"
output_file="allSchemas.graphql"

# Temporary files to store extracted queries and mutations
temp_queries="temp_queries.txt"
temp_mutations="temp_mutations.txt"

# Ensure the output and temporary files are clean
> "$output_file"
> "$temp_queries"
> "$temp_mutations"

# Delete files if they exist
[ -f "$temp_queries" ] && rm "$temp_queries"
[ -f "$temp_mutations" ] && rm "$temp_mutations"
[ -f "$output_file" ] && rm "$output_file"

# Loop through all the files in the input folder
for file in "$input_folder"/*; do
  # Check if it's a regular file
  if [ -f "$file" ]; then
    # Extract lines before `# QUERIES` and append them to the output file
    echo -e "\n# FILE: $(basename "$file" | tr '[:lower:]' '[:upper:]') BEFORE # QUERIES" >> "$output_file"
    awk '!/# QUERIES/ {print} /# QUERIES/ {exit}' "$file" >> "$output_file"

    # MUTATIONS AND QUERIES LOGIC:
    # Extract the file name for comments
    file_name=$(basename "$file" | sed 's/\..*//') # Remove extension for clarity

    # Add a comment indicating the file's source for queries
    echo -e "\n  # ${file_name^^} FILE QUERIES:" >> "$temp_queries"

    # Extract the lines inside `# QUERIES type Query { ... }`
    awk '/# QUERIES/,/}/' "$file" | sed -e '1d' -e '$d' >> "$temp_queries"

    # Remove lines starting with "type Query {" or "}" from temp_queries
    sed -i '/^type Query {/d;/^}/d' "$temp_queries"

    # Add a comment indicating the file's source for mutations
    echo -e "\n  # ${file_name^^} FILE MUTATIONS:" >> "$temp_mutations"

    # Extract the lines inside `# MUTATIONS type Mutation { ... }`
    awk '/# MUTATIONS/,/}/' "$file" | sed -e '1d' -e '$d' >> "$temp_mutations"

    # Remove lines starting with "type Mutation {" or "}" from temp_mutations
    sed -i '/^type Mutation {/d;/^}/d' "$temp_mutations"
  fi
done

# Append consolidated queries to the output file
echo -e "\n# CONSOLIDATED QUERIES\ntype Query {" >> "$output_file"
cat "$temp_queries" >> "$output_file"
echo "}" >> "$output_file"

# Append consolidated mutations to the output file
echo -e "\n# CONSOLIDATED MUTATIONS\ntype Mutation {" >> "$output_file"
cat "$temp_mutations" >> "$output_file"
echo "}" >> "$output_file"

# Clean up the temporary files
rm "$temp_queries" "$temp_mutations"

echo "All files from $input_folder have been processed and saved into $output_file."
