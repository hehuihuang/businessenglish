#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix mixed quotes in lesson files - convert all to single quotes
"""
import re
import os

def fix_quotes(content):
    """Convert all double quotes to single quotes, handle apostrophes properly"""

    # Step 1: Replace Chinese curly quotes with straight double quotes first
    result = content.replace('"', '"')
    result = result.replace('"', '"')

    # Step 2: Now we need to carefully replace double quotes with single quotes
    # while escaping apostrophes that appear within strings

    # Strategy: Process character by character, tracking if we're inside a string
    output = []
    i = 0
    in_string = False
    string_delimiter = None

    while i < len(result):
        char = result[i]

        if not in_string:
            if char == '"':
                # Start of a string - convert to single quote
                output.append("'")
                in_string = True
                string_delimiter = '"'
            elif char == "'":
                # Already a single quote at start
                output.append("'")
                in_string = True
                string_delimiter = "'"
            else:
                output.append(char)
        else:
            # We're inside a string
            if char == '\\' and i + 1 < len(result):
                # Escape sequence - keep both characters
                output.append(char)
                output.append(result[i + 1])
                i += 1
            elif char == string_delimiter:
                # End of string
                if string_delimiter == '"':
                    output.append("'")
                else:
                    output.append("'")
                in_string = False
                string_delimiter = None
            elif char == "'" and string_delimiter == '"':
                # Apostrophe inside a double-quoted string - needs escaping
                output.append("\\'")
            else:
                output.append(char)

        i += 1

    return ''.join(output)

def process_file(filepath):
    """Process a single file"""
    print(f"Processing {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fixed_content = fix_quotes(content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_content)

    print(f"Fixed {filepath}")

def main():
    files = [
        'lessons_01_08.js',
        'lessons_09_16.js',
        'lessons_17_24.js',
        'lessons_25_32.js',
        'lessons_33_40.js'
    ]

    base_dir = os.path.dirname(os.path.abspath(__file__))

    for filename in files:
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            process_file(filepath)
        else:
            print(f"File not found: {filepath}")

if __name__ == '__main__':
    main()
