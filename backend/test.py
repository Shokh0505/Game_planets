
def parse_definitions(input_string):
    word_dict = {}
    lines = input_string.split("\n")  
    current_word = None
    definition_lines = []

    for line in lines:
        if not line.strip():
            continue

        # If the line starts a new word-definition pair
        if line.strip()[0].isdigit() and ':' in line:
            if current_word:
                word_dict[current_word.strip()] = " ".join(definition_lines).strip()

            current_word, first_definition = line.split(":", 1)
            definition_lines = [first_definition.strip()]  
        else:
            definition_lines.append(line.strip())

    if current_word:
        word_dict[current_word.strip()] = " ".join(definition_lines).strip()

    return word_dict


input_string = """1. Word: This is a definition.
2. Another Word This is another definition.
3. Yet Another: This one is multi-line
   and continues here."""


items = parse_definitions(input_string)

for key, item in items.items():
    print(key, ' : ', item)