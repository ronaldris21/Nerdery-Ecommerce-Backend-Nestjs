#!/bin/bash

# Define la carpeta de entrada y el archivo de salida
input_folder="graphql-typeDefinitions"
output_file="allSchemas.graphql"

# Archivos temporales para almacenar las queries y mutations extraídas
temp_queries="temp_queries.txt"
temp_mutations="temp_mutations.txt"

# Asegúrate de limpiar los archivos de salida y temporales
> "$output_file"
> "$temp_queries"
> "$temp_mutations"

# Elimina los archivos si existen
[ -f "$temp_queries" ] && rm "$temp_queries"
[ -f "$temp_mutations" ] && rm "$temp_mutations"
[ -f "$output_file" ] && rm "$output_file"


# ADD GENERIC ENUM AND SCALAR TYPES:
# Define the secondary input folder for generic files
generic_folder="graphql-typeDefinitions/generic"

# Loop through all the files in the generic folder
for file in "$generic_folder"/*; do
  # Check if it's a regular file
  if [ -f "$file" ]; then
    # Append the full content of the file to the output
    echo -e "\n# GENERIC FILE: $(basename "$file" | tr '[:lower:]' '[:upper:]')" >> "$output_file"
    echo -e "\n" >> "$output_file"
    cat "$file" >> "$output_file"
  fi
done


echo -e "\n" >> "$output_file"



# Bucle a través de todos los archivos en la carpeta de entrada
for file in "$input_folder"/*; do
  # Comprueba si es un archivo regular
  if [ -f "$file" ]; then
    # Extrae las líneas antes de `type Query {` y agrégalas al archivo de salida
    # echo -e "\n# FILE: $(basename "$file" | tr '[:lower:]' '[:upper:]') BEFORE type Query {" >> "$output_file"
    awk '!/type Query {/ {print} /type Query {/ {exit}' "$file" >> "$output_file"

    # LÓGICA PARA EXTRAER QUERIES Y MUTATIONS:
    # Extrae el nombre del archivo para los comentarios
    file_name=$(basename "$file" | sed 's/\..*//') # Elimina la extensión para claridad

    # Agrega un comentario indicando la fuente para las queries
    echo -e "\n  # ${file_name^^} FILE QUERIES:" >> "$temp_queries"

    # Extrae las líneas dentro de `type Query { ... }`
    awk '/type Query {/,/}/' "$file" | sed -e '1d' -e '$d' >> "$temp_queries"

    # Elimina líneas que comiencen con "type Query {" o "}" del archivo temporal de queries
    sed -i '/^type Query {/d;/^}/d' "$temp_queries"

    # Agrega un comentario indicando la fuente para las mutations
    echo -e "\n  # ${file_name^^} FILE MUTATIONS:" >> "$temp_mutations"

    # Extrae las líneas dentro de `type Mutation { ... }`
    awk '/type Mutation {/,/}/' "$file" | sed -e '1d' -e '$d' >> "$temp_mutations"

    # Elimina líneas que comiencen con "type Mutation {" o "}" del archivo temporal de mutations
    sed -i '/^type Mutation {/d;/^}/d' "$temp_mutations"
  fi
done

# Agrega las queries consolidadas al archivo de salida
echo -e "\n# CONSOLIDATED QUERIES\ntype Query {" >> "$output_file"
cat "$temp_queries" >> "$output_file"
echo "}" >> "$output_file"

# Agrega las mutations consolidadas al archivo de salida
echo -e "\n# CONSOLIDATED MUTATIONS\ntype Mutation {" >> "$output_file"
cat "$temp_mutations" >> "$output_file"
echo "}" >> "$output_file"

# Limpia los archivos temporales
rm "$temp_queries" "$temp_mutations"

echo "Todos los archivos de $input_folder han sido procesados y guardados en $output_file."
