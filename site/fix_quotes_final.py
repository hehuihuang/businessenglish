import os
import re

def fix_all_quotes(content):
    """
    Strategy: Replace ALL quotes (single and double) with a placeholder,
    then reconstruct with proper double quotes, keeping Chinese quotes as regular single quotes
    """

    # Step 1: Replace Chinese curly quotes with a unique placeholder
    content = content.replace('"', '<<<CHINESE_QUOTE_LEFT>>>')
    content = content.replace('"', '<<<CHINESE_QUOTE_RIGHT>>>')

    # Step 2: Normalize all string delimiters to double quotes
    # This regex finds single-quoted strings and converts them to double-quoted
    # But we need to be careful with apostrophes

    # Replace single quotes used as string delimiters with double quotes
    # Pattern: 'text' where text doesn't contain unescaped single quotes (except apostrophes in words)
    def replace_string_quotes(match):
        content = match.group(1)
        # This is a string delimiter, convert to double quotes
        return f'"{content}"'

    # Match single-quoted strings (handling apostrophes inside)
    # This pattern matches: 'anything including apostrophes in words'
    content = re.sub(r"'([^']*(?:'[st]|'[mdlr]e|'ll|'ve|'re)?[^']*)'", replace_string_quotes, content)

    # Step 3: Convert Chinese quote placeholders to regular single quotes
    content = content.replace('<<<CHINESE_QUOTE_LEFT>>>', "'")
    content = content.replace('<<<CHINESE_QUOTE_RIGHT>>>', "'")

    return content

os.chdir('data')

for filename in ['lessons_01_08.js', 'lessons_09_16.js', 'lessons_17_24.js',
                 'lessons_25_32.js', 'lessons_33_40.js']:
    print(f'Processing {filename}...')

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    fixed = fix_all_quotes(content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(fixed)

    print(f'  Fixed {filename}')

print('\nAll files fixed!')
