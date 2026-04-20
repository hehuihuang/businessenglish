import os

# Simple approach: normalize ALL quotes to double quotes, then handle Chinese quotes specially

os.chdir('data')

for filename in ['lessons_01_08.js', 'lessons_09_16.js', 'lessons_17_24.js',
                 'lessons_25_32.js', 'lessons_33_40.js']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Replace Chinese curly quotes with a placeholder
    content = content.replace('"', '<<<CQ_LEFT>>>')
    content = content.replace('"', '<<<CQ_RIGHT>>>')

    # Step 2: Replace ALL single quotes with double quotes
    content = content.replace("'", '"')

    # Step 3: Replace placeholders with straight single quotes (escaped for JS strings)
    content = content.replace('<<<CQ_LEFT>>>', "\\'")
    content = content.replace('<<<CQ_RIGHT>>>', "\\'")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Fixed {filename}')

print('Done!')
