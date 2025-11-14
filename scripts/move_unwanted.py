import os
import shutil

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
unwanted = os.path.join(root, 'unwanted')

items = [
    'final-1.ipynb',
    'review-3-traffic-accidents.ipynb',
    'dft-road-casualty-statistics-vehicle-last-5-years-1.csv',
    'litemodel.sav',
    'nohup.out',
    'package-lock.json',
    '.ipynb_checkpoints',
    'venv'
]

moved = []
missing = []

for name in items:
    src = os.path.join(root, name)
    if os.path.exists(src):
        dst = os.path.join(unwanted, name)
        try:
            # If destination exists, remove it first to allow move
            if os.path.exists(dst):
                if os.path.isdir(dst) and not os.path.islink(dst):
                    shutil.rmtree(dst)
                else:
                    os.remove(dst)
            shutil.move(src, dst)
            moved.append(name)
        except Exception as e:
            print(f'Failed to move {name}: {e}')
    else:
        # also try globbing for ipynb files
        if name == 'final-1.ipynb':
            # move any ipynb files present
            for f in os.listdir(root):
                if f.endswith('.ipynb'):
                    s = os.path.join(root, f)
                    d = os.path.join(unwanted, f)
                    try:
                        if os.path.exists(d):
                            if os.path.isdir(d):
                                shutil.rmtree(d)
                            else:
                                os.remove(d)
                        shutil.move(s, d)
                        moved.append(f)
                    except Exception as e:
                        print(f'Failed to move {f}: {e}')
        else:
            missing.append(name)

print('Moved:')
for m in moved:
    print(' -', m)

if missing:
    print('\nNot found:')
    for m in missing:
        print(' -', m)
else:
    print('\nAll specified items handled.')
