import os
import re

def fix_quotes_properly(content):
    # First, convert all single quotes back to double quotes for string delimiters
    # This is a simple replacement since we know the structure
    content = content.replace("{ en: '", '{ en: "')
    content = content.replace("', zh: '", '", zh: "')
    content = content.replace("' }", '" }')

    # Also fix other single-quoted strings
    content = content.replace("term: '", 'term: "')
    content = content.replace("chinese: '", 'chinese: "')
    content = content.replace("definition: '", 'definition: "')
    content = content.replace("note: '", 'note: "')

    # Fix closing quotes for these fields (look for patterns like ', at end)
    content = re.sub(r"',(\s*)(examples|term|chinese|definition|note)", r'",\1\2', content)

    # Now replace the escaped single quotes (from Chinese quotes) with regular single quotes
    content = content.replace("\\'", "'")

    return content

os.chdir('data')

for filename in ['lessons_01_08.js', 'lessons_09_16.js', 'lessons_17_24.js',
                 'lessons_25_32.js', 'lessons_33_40.js']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    fixed = fix_quotes_properly(content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(fixed)

    print(f'Fixed {filename}')

print('All files fixed!')
