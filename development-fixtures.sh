#!/bin/bash

function giberishGenerator() {
  tr -dc A-Za-z0-9 </dev/urandom | head -c 200 > $1
}

dotfiles_dir=$HOME/dotfiles
dest_dir=$HOME/dest

cd $HOME

echo "Cleaning up test directories"
if [ -d "$dotfiles_dir" ]; then
  rm -rf $dotfiles_dir
fi

if [ -d "$dest_dir" ]; then
  ls -la $dest_dir
  rm -rf $dest_dir
fi

echo "Creating new test directories"
mkdir $dotfiles_dir
mkdir $dest_dir

cd dotfiles

echo "Creating $dotfiles_dir/test.conf.link file"
touch test.conf.link
giberishGenerator ./test.conf.link

echo "Creating $dotfiles_dir/test.dir.link directory"
mkdir test.dir.link
cd test.dir.link
echo "Creating $dotfiles_dir/test.dir.link/nested.conf.link.1 file"
touch nested.conf.link.1
giberishGenerator ./nested.conf.link.1
echo "Creating $dotfiles_dir/test.dir.link/nested.conf.link.2 file"
touch nested.conf.link.2
giberishGenerator ./nested.conf.link.2

cd ..

echo "Creating $dotfiles_dir/test.conf.copy file"
touch test.conf.copy
giberishGenerator ./test.conf.copy

echo "Creating $dotfiles_dir/test.dir.copy directory"
mkdir test.dir.copy
cd test.dir.copy
echo "Creating $dotfiles_dir/test.dir.copy/nested.conf.copy.1 file"
touch nested.conf.copy.1
giberishGenerator ./nested.conf.copy.1
echo "Creating $dotfiles_dir/test.dir.copy/nested.conf.copy.2 file"
touch nested.conf.copy.2
giberishGenerator ./nested.conf.copy.2

cd ..

echo "Creating $dotfiles_dir/.dotfiler.json file"
touch .dotfiler.json
cat >.dotfiler.json <<EOF
{
  "configs": [
    {
      "src":"test.conf.link",
      "dest":"${dest_dir}/test.conf.link"
    },
    {
      "src":"test.dir.link",
      "dest":"${dest_dir}/test.dir.link"
    },
    {
      "src":"test.conf.copy",
      "dest":"${dest_dir}/test.conf.copy",
      "copy": true
    },
    {
      "src":"test.dir.copy",
      "dest":"${dest_dir}/test.dir.copy",
      "copy": true
    }
  ]
}
EOF

cd /src

# later we have to create a file in the dotfiles directory that points to a file that already exists
