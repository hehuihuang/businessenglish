import os

def fix_quotes_final(content):
    # Replace Chinese curly quotes with escaped single quotes
    content = content.replace('"', "\\'")
    content = content.replace('"', "\\'")
    return content

os.chdir('data')

for filename in ['lessons_01_08.js', 'lessons_09_16.js', 'lessons_17_24.js',
                 'lessons_25_32.js', 'lessons_33_40.js']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    fixed = fix_quotes_final(content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(fixed)

    print(f'Fixed {filename}')

print('All files fixed!')
